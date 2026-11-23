import "server-only";
import sql from "mssql";
import { storedResultSchema, summarizeResult, type TestResult, type StoredTestResult } from "./results";

export class StorageError extends Error {}

let poolPromise: Promise<sql.ConnectionPool> | undefined;

export async function getPool() {
  const server = process.env.SQL_SERVER;
  const database = process.env.SQL_DATABASE;
  if (!server || !database) throw new StorageError("Result history is not connected yet. A parent needs to configure Azure SQL before results can be saved.");
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      server, database,
      authentication: {
        type: "azure-active-directory-default",
        options: { clientId: process.env.SQL_MANAGED_IDENTITY_CLIENT_ID || undefined },
      },
      options: { encrypt: true, trustServerCertificate: false },
      pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
      connectionTimeout: 15000,
      requestTimeout: 15000,
    }).on("error", (error: Error) => {
      console.error("Azure SQL pool error:", error);
    }).connect().catch((error: unknown) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

export interface StoredResult {
  attemptId: string;
  completedAt: Date;
  result: StoredTestResult;
}

interface ResultRow {
  AttemptId: string;
  CompletedAt: Date;
  ResultJson: string;
}

function decode(row: ResultRow): StoredResult {
  return { attemptId: row.AttemptId, completedAt: row.CompletedAt, result: storedResultSchema.parse(JSON.parse(row.ResultJson)) };
}

export async function saveResult(userId: string, attemptId: string, result: TestResult) {
  const pool = await getPool();
  const json = JSON.stringify(summarizeResult(result));
  const response = await pool.request()
    .input("userId", sql.NVarChar(255), userId)
    .input("attemptId", sql.UniqueIdentifier, attemptId)
    .input("json", sql.NVarChar(sql.MAX), json)
    .query<ResultRow>(`
      SET XACT_ABORT ON;
      BEGIN TRANSACTION;
      IF NOT EXISTS (
        SELECT 1 FROM dbo.TestResults WITH (UPDLOCK, HOLDLOCK)
        WHERE UserId = @userId AND AttemptId = @attemptId
      )
        INSERT dbo.TestResults (UserId, AttemptId, ResultJson)
        VALUES (@userId, @attemptId, @json);
      SELECT AttemptId, CompletedAt, ResultJson FROM dbo.TestResults
      WHERE UserId = @userId AND AttemptId = @attemptId;
      COMMIT TRANSACTION;
    `);
  const row = response.recordset[0];
  if (!row) throw new StorageError("Your result could not be confirmed after saving. Please retry.");
  const stored = decode(row);
  if (JSON.stringify(summarizeResult(stored.result)) !== json) throw new StorageError("This attempt was already saved with a different score. Start a new test to save a new result.");
  return stored;
}

export const HISTORY_PAGE_SIZE = 20;

export async function listResults(userId: string, page: number) {
  const pool = await getPool();
  const request = () => pool.request().input("userId", sql.NVarChar(255), userId);
  const [rows, count] = await Promise.all([
    request().input("offset", sql.Int, (page - 1) * HISTORY_PAGE_SIZE).input("limit", sql.Int, HISTORY_PAGE_SIZE)
      .query<ResultRow>(`SELECT AttemptId, CompletedAt, ResultJson FROM dbo.TestResults
        WHERE UserId = @userId ORDER BY CompletedAt DESC, AttemptId DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;`),
    request().query<{ Total: number }>("SELECT COUNT(*) AS Total FROM dbo.TestResults WHERE UserId = @userId;"),
  ]);
  return { results: rows.recordset.map(decode), total: count.recordset[0].Total };
}

export async function findResult(userId: string, attemptId: string) {
  const pool = await getPool();
  const response = await pool.request()
    .input("userId", sql.NVarChar(255), userId)
    .input("attemptId", sql.UniqueIdentifier, attemptId)
    .query<ResultRow>("SELECT AttemptId, CompletedAt, ResultJson FROM dbo.TestResults WHERE UserId = @userId AND AttemptId = @attemptId;");
  return response.recordset[0] ? decode(response.recordset[0]) : undefined;
}
