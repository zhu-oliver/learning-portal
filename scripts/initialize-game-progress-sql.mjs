import fs from "node:fs";
import { randomUUID } from "node:crypto";
import sql from "mssql";

const { SQL_SERVER, SQL_DATABASE, APP_IDENTITY_NAME } = process.env;
if (!SQL_SERVER || !SQL_DATABASE || !/^[a-zA-Z0-9-]+$/.test(APP_IDENTITY_NAME ?? "")) {
  throw new Error("Set SQL_SERVER, SQL_DATABASE and APP_IDENTITY_NAME.");
}
const pool = new sql.ConnectionPool({
  server: SQL_SERVER, database: SQL_DATABASE,
  authentication: { type: "azure-active-directory-default", options: {} },
  options: { encrypt: true, trustServerCertificate: false },
  connectionTimeout: 30000, requestTimeout: 30000,
});
pool.on("error", error => console.error("Game progress database error:", error.name));
try {
  await pool.connect();
  await pool.request().batch(fs.readFileSync(new URL("../infra/game-progress.sql", import.meta.url), "utf8"));
  const permissions = await pool.request().input("name", sql.NVarChar(128), APP_IDENTITY_NAME).query(`
    IF USER_ID(@name) IS NULL THROW 50001, 'Provision the app managed identity first.', 1;
    DECLARE @grant NVARCHAR(MAX)=N'GRANT SELECT, INSERT, UPDATE ON OBJECT::dbo.GameProgress TO '+QUOTENAME(@name);
    EXEC sp_executesql @grant;
    SELECT permission_name FROM sys.database_permissions WHERE grantee_principal_id=USER_ID(@name)
      AND major_id=OBJECT_ID(N'dbo.GameProgress') AND state='G';
  `);
  if (JSON.stringify(permissions.recordset.map(row => row.permission_name).sort()) !== JSON.stringify(["INSERT", "SELECT", "UPDATE"])) {
    throw new Error("Game progress permission verification failed.");
  }
  const probe = await pool.request()
    .input("name", sql.NVarChar(128), APP_IDENTITY_NAME)
    .input("ownerA", sql.NVarChar(255), `progress-check:${randomUUID()}`)
    .input("ownerB", sql.NVarChar(255), `progress-check:${randomUUID()}`)
    .batch(`
      BEGIN TRY
        BEGIN TRANSACTION;
        EXECUTE AS USER = '${APP_IDENTITY_NAME}';
        INSERT dbo.GameProgress (UserId,Game,ProgressJson) VALUES (@ownerA,'math-army',N'{"stars":[1]}'),(@ownerB,'math-army',N'{"stars":[2]}');
        UPDATE dbo.GameProgress SET ProgressJson=N'{"stars":[3]}' WHERE UserId=@ownerA AND Game='math-army';
        SELECT ProgressJson FROM dbo.GameProgress WHERE UserId=@ownerA AND Game='math-army';
        SELECT ProgressJson FROM dbo.GameProgress WHERE UserId=@ownerB AND Game='math-army';
        REVERT;
        ROLLBACK TRANSACTION;
      END TRY
      BEGIN CATCH
        IF USER_NAME()=@name REVERT;
        IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
        THROW;
      END CATCH;
    `);
  if (probe.recordsets[0]?.[0]?.ProgressJson !== '{"stars":[3]}' || probe.recordsets[1]?.[0]?.ProgressJson !== '{"stars":[2]}') {
    throw new Error("Runtime identity read/write verification failed.");
  }
  console.log("Game progress schema, runtime identity read/write permissions, and isolated account queries verified. Test writes rolled back; existing permissions unchanged.");
} catch (cause) {
  console.error("Game progress initialization failed:", cause.message);
  process.exitCode = 1;
} finally { await pool.close(); }
