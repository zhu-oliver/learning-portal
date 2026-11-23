import sql from "mssql";
import { randomUUID } from "node:crypto";

async function main() {
  if (!process.env.SQL_SERVER || !process.env.SQL_DATABASE) throw new Error("SQL settings are missing.");
  const pool = new sql.ConnectionPool({
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    authentication: { type: "azure-active-directory-default", options: {} },
    options: { encrypt: true, trustServerCertificate: false },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  });
  pool.on("error", (error) => console.error("SQL connection error:", error.message));
  try {
    await pool.connect();
    const permissions = await pool.request().query(`
      SELECT HAS_PERMS_BY_NAME('dbo.TestResults', 'OBJECT', 'SELECT') AS CanRead,
        HAS_PERMS_BY_NAME('dbo.TestResults', 'OBJECT', 'INSERT') AS CanInsert,
        HAS_PERMS_BY_NAME('dbo.TestResults', 'OBJECT', 'DELETE') AS CanDelete,
        HAS_PERMS_BY_NAME('dbo.TestResults', 'OBJECT', 'UPDATE') AS CanUpdate;
    `);
    const rights = permissions.recordset[0];
    if (rights.CanRead !== 1 || rights.CanInsert !== 1 || rights.CanDelete !== 0 || rights.CanUpdate !== 0) {
      throw new Error("Application identity permissions are not SELECT/INSERT-only.");
    }
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const attemptId = randomUUID();
      const userId = "__app_deployment_verification__";
      await new sql.Request(transaction)
        .input("userId", sql.NVarChar(255), userId)
        .input("attemptId", sql.UniqueIdentifier, attemptId)
        .input("json", sql.NVarChar(sql.MAX), JSON.stringify({ verification: true }))
        .query("INSERT dbo.TestResults (UserId, AttemptId, ResultJson) VALUES (@userId, @attemptId, @json);");
      const check = await new sql.Request(transaction)
        .input("userId", sql.NVarChar(255), userId)
        .input("attemptId", sql.UniqueIdentifier, attemptId)
        .query("SELECT CompletedAt FROM dbo.TestResults WHERE UserId = @userId AND AttemptId = @attemptId;");
      if (check.recordset.length !== 1 || !check.recordset[0].CompletedAt) throw new Error("Result insert/read failed.");
      console.log("Azure managed-identity SQL access, minimal permissions, and result insert/read verified.");
    } finally {
      await transaction.rollback();
      console.log("Verification transaction rolled back; no test records retained.");
    }
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("App SQL verification failed:", error.message);
  process.exitCode = 1;
});
