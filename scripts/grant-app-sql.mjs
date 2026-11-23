import sql from "mssql";

const { SQL_SERVER, SQL_DATABASE, APP_IDENTITY_CLIENT_ID, APP_IDENTITY_OBJECT_ID, APP_IDENTITY_NAME } = process.env;

async function main() {
  if (!SQL_SERVER || !SQL_DATABASE || !APP_IDENTITY_NAME ||
      !/^[a-zA-Z0-9-]+$/.test(APP_IDENTITY_NAME) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(APP_IDENTITY_CLIENT_ID ?? "") ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(APP_IDENTITY_OBJECT_ID ?? "")) {
    throw new Error("Set the SQL hostname/database and valid App Service identity name, client ID, and object ID.");
  }
  const pool = new sql.ConnectionPool({
    server: SQL_SERVER,
    database: SQL_DATABASE,
    authentication: { type: "azure-active-directory-default", options: {} },
    options: { encrypt: true, trustServerCertificate: false },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  });
  pool.on("error", (error) => console.error("SQL connection error:", error.message));
  try {
    await pool.connect();
    const response = await pool.request()
      .input("name", sql.NVarChar(128), APP_IDENTITY_NAME)
      .input("clientId", sql.UniqueIdentifier, APP_IDENTITY_CLIENT_ID)
      .input("objectId", sql.UniqueIdentifier, APP_IDENTITY_OBJECT_ID)
      .query(`
        -- SQL service-principal SIDs use the application/client ID, not the object ID.
        DECLARE @sid VARBINARY(16) = CONVERT(VARBINARY(16), @clientId);
        IF EXISTS (SELECT 1 FROM sys.database_principals
          WHERE name = @name AND sid = CONVERT(VARBINARY(16), @objectId) AND type = 'E')
        BEGIN
          DECLARE @drop NVARCHAR(MAX) = N'DROP USER ' + QUOTENAME(@name);
          EXEC sp_executesql @drop;
        END;
        IF EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @name AND sid <> @sid)
          THROW 50001, 'An existing database user has a different identity.', 1;
        IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = @name)
        BEGIN
          DECLARE @create NVARCHAR(MAX) = N'CREATE USER ' + QUOTENAME(@name)
            + N' WITH SID = ' + CONVERT(VARCHAR(34), @sid, 1) + N', TYPE = E;';
          EXEC sp_executesql @create;
        END;
        DECLARE @grant NVARCHAR(MAX) = N'GRANT SELECT, INSERT ON OBJECT::dbo.TestResults TO ' + QUOTENAME(@name);
        EXEC sp_executesql @grant;
        SELECT permission_name AS PermissionName FROM sys.database_permissions
        WHERE grantee_principal_id = USER_ID(@name)
          AND major_id = OBJECT_ID(N'dbo.TestResults') AND state = 'G';
      `);
    const permissions = response.recordset.map((row) => row.PermissionName).sort();
    if (JSON.stringify(permissions) !== JSON.stringify(["INSERT", "SELECT"])) {
      throw new Error("Managed identity table permissions did not match SELECT and INSERT.");
    }
    console.log("App Service managed identity verified with SELECT and INSERT permissions only.");
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("Managed identity database setup failed:", error.message);
  process.exitCode = 1;
});
