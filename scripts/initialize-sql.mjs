import fs from "node:fs";
import { randomUUID } from "node:crypto";
import sql from "mssql";

async function main() {
  const server = process.env.SQL_SERVER;
  const database = process.env.SQL_DATABASE;
  if (!server || !database) throw new Error("Set SQL_SERVER and SQL_DATABASE before initializing.");

  const pool = new sql.ConnectionPool({
    server,
    database,
    authentication: { type: "azure-active-directory-default", options: {} },
    options: { encrypt: true, trustServerCertificate: false },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  });
  pool.on("error", (error) => console.error("Azure SQL connection error:", error.message));

  try {
    await pool.connect();
    await pool.request().batch(fs.readFileSync(new URL("../infra/schema.sql", import.meta.url), "utf8"));
    const schema = await pool.request().query(`
      SELECT DB_NAME() AS DatabaseName,
        OBJECT_ID(N'dbo.TestResults', N'U') AS ResultsTableId,
        (SELECT COUNT(*) FROM sys.indexes
         WHERE object_id = OBJECT_ID(N'dbo.TestResults')
           AND name = N'IX_TestResults_UserDate') AS HistoryIndexCount;
    `);
    if (!schema.recordset[0].ResultsTableId || schema.recordset[0].HistoryIndexCount !== 1) {
      throw new Error("Results table or history index verification failed.");
    }
    console.log("Results table and history index verified:", schema.recordset[0].DatabaseName);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const attemptId = randomUUID();
      await new sql.Request(transaction)
        .input("userId", sql.NVarChar(255), "__deployment_verification__")
        .input("attemptId", sql.UniqueIdentifier, attemptId)
        .input("json", sql.NVarChar(sql.MAX), JSON.stringify({ verification: true }))
        .query(`INSERT dbo.TestResults (UserId, AttemptId, ResultJson)
          VALUES (@userId, @attemptId, @json);`);
      const check = await new sql.Request(transaction)
        .input("attemptId", sql.UniqueIdentifier, attemptId)
        .query(`SELECT UserId, CompletedAt, ResultJson FROM dbo.TestResults
          WHERE UserId = N'__deployment_verification__' AND AttemptId = @attemptId;`);
      if (check.recordset.length !== 1 || !check.recordset[0].CompletedAt ||
          JSON.parse(check.recordset[0].ResultJson).verification !== true) {
        throw new Error("Result insert/read verification failed.");
      }
      console.log("Parameterized result insert/read and database completion timestamp verified.");
    } finally {
      await transaction.rollback();
      console.log("Verification transaction rolled back; no sample results retained.");
    }
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("Azure SQL initialization failed:", error.message);
  process.exitCode = 1;
});
