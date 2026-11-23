import sql from "mssql";

const legacyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const target = process.env.RECOVERY_GOOGLE_USER_ID;
  const confirmedCount = Number(process.env.RECOVERY_CONFIRMED_COUNT);
  if (!process.env.SQL_SERVER || !process.env.SQL_DATABASE) throw new Error("SQL settings are required.");
  if (target && !/^google:[0-9]{10,255}$/.test(target)) throw new Error("Use a verified Google session user ID.");
  const pool = new sql.ConnectionPool({
    server: process.env.SQL_SERVER, database: process.env.SQL_DATABASE,
    authentication: { type: "azure-active-directory-default", options: {} },
    options: { encrypt: true, trustServerCertificate: false },
  });
  pool.on("error", (error) => console.error("SQL connection error:", error.message));
  try {
    await pool.connect();
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    try {
      const owners = await new sql.Request(transaction).query("SELECT UserId, COUNT(*) AS Attempts FROM dbo.TestResults WITH (UPDLOCK, HOLDLOCK) GROUP BY UserId;");
      const legacy = owners.recordset.filter((row) => legacyPattern.test(row.UserId));
      const count = legacy.reduce((sum, row) => sum + row.Attempts, 0);
      console.log(`Legacy results: ${count}; legacy sign-in IDs: ${legacy.length}; stable account owners: ${owners.recordset.length - legacy.length}.`);
      if (!target) {
        await transaction.rollback();
        console.log("Inspection only. No results changed.");
        return;
      }
      if (!Number.isSafeInteger(confirmedCount) || confirmedCount < 1 || count !== confirmedCount) {
        throw new Error("Confirm the exact inspected legacy result count before recovery.");
      }
      let recovered = 0;
      for (const owner of legacy) {
        const response = await new sql.Request(transaction)
          .input("oldOwner", sql.NVarChar(255), owner.UserId)
          .input("newOwner", sql.NVarChar(255), target)
          .query("UPDATE dbo.TestResults SET UserId = @newOwner WHERE UserId = @oldOwner;");
        recovered += response.rowsAffected[0];
      }
      if (recovered !== confirmedCount) throw new Error("Recovery count did not match; rolling back.");
      await transaction.commit();
      console.log(`Recovered ${recovered} results to the verified account. Answers, scores, attempt IDs, and completion dates were preserved.`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("Legacy result recovery failed:", error.message);
  process.exitCode = 1;
});
