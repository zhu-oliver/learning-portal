import fs from "node:fs";
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
pool.on("error", (error) => console.error("AI database connection error:", error.name));
try {
  await pool.connect();
  await pool.request().batch(fs.readFileSync(new URL("../infra/ai-learning.sql", import.meta.url), "utf8"));
  const permissions = await pool.request().input("name", sql.NVarChar(128), APP_IDENTITY_NAME).query(`
    IF USER_ID(@name) IS NULL THROW 50001, 'Provision the existing app managed identity first.', 1;
    DECLARE @grant NVARCHAR(MAX) = N'GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.AiLearning TO ' + QUOTENAME(@name);
    EXEC sp_executesql @grant;
    SELECT permission_name FROM sys.database_permissions WHERE grantee_principal_id=USER_ID(@name)
      AND major_id=OBJECT_ID(N'dbo.AiLearning') AND state='G';
  `);
  const names = permissions.recordset.map((row) => row.permission_name).sort();
  if (JSON.stringify(names) !== JSON.stringify(["DELETE", "INSERT", "SELECT", "UPDATE"])) throw new Error("AI table permission verification failed.");
  console.log("AI learning table, indexes and table-scoped app permissions verified. Existing result permissions unchanged.");
} catch (cause) {
  console.error("AI database initialization failed:", cause.message);
  process.exitCode = 1;
} finally { await pool.close(); }
