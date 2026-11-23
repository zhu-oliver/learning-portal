import "server-only";
import sql from "mssql";
import { randomUUID } from "node:crypto";
import { getPool } from "./db";
import { aiRequestSchema, parseAiDocument, studioStatusSchema, type AiDocument, type AiRequest, type StudioItem } from "@/modules/ai-content";

export class StudioError extends Error {}
const failureMessages: Record<string, string> = {
  model: "The local model could not generate a valid lesson. Check LM Studio and try a new request.",
  expired: "The request expired while waiting for the local connector. Check that the connector and LM Studio are running, then try again.",
};
type Row = { Id: string; Title: string; Status: string; CreatedAt: Date; ContentJson?: string | null; ErrorCode: string | null };
function decode(row: Row): StudioItem {
  return {
    id: row.Id.toLowerCase(), title: row.Title, status: studioStatusSchema.parse(row.Status),
    createdAt: row.CreatedAt.toISOString(),
    document: row.ContentJson ? parseAiDocument(JSON.parse(row.ContentJson)) : null,
    error: row.Status === "failed" ? failureMessages[row.ErrorCode ?? ""] ?? "Generation failed. Please try a new request." : null,
  };
}

export async function listStudioItems(userId: string): Promise<StudioItem[]> {
  const pool = await getPool();
  const result = await pool.request().input("userId", sql.NVarChar(255), userId)
    .query<Row>(`SELECT TOP (100) Id, Title,
      CASE WHEN Status IN ('queued','processing') AND CreatedAt < DATEADD(hour,-24,SYSUTCDATETIME()) THEN 'failed' ELSE Status END AS Status,
      CreatedAt, CASE WHEN Status IN ('queued','processing') AND CreatedAt < DATEADD(hour,-24,SYSUTCDATETIME()) THEN 'expired' ELSE ErrorCode END AS ErrorCode
      FROM dbo.AiLearning WHERE UserId = @userId AND (ErrorCode IS NULL OR ErrorCode <> 'deleted') ORDER BY CreatedAt DESC, Id DESC;`);
  return result.recordset.map(decode);
}

export async function findStudioItem(userId: string, id: string): Promise<StudioItem | undefined> {
  const pool = await getPool();
  const result = await pool.request().input("userId", sql.NVarChar(255), userId).input("id", sql.UniqueIdentifier, id)
    .query<Row>("SELECT Id, Title, Status, CreatedAt, ContentJson, ErrorCode FROM dbo.AiLearning WHERE UserId = @userId AND Id = @id AND (ErrorCode IS NULL OR ErrorCode <> 'deleted');");
  return result.recordset[0] ? decode(result.recordset[0]) : undefined;
}

export async function queueStudioItem(userId: string, id: string, request: AiRequest) {
  const payload = aiRequestSchema.parse(request);
  const pool = await getPool();
  const result = await pool.request().input("userId", sql.NVarChar(255), userId).input("id", sql.UniqueIdentifier, id)
    .input("title", sql.NVarChar(120), payload.prompt.slice(0, 120)).input("request", sql.NVarChar(sql.MAX), JSON.stringify(payload))
    .query<{ Outcome: string }>(`
      SET XACT_ABORT ON;
      BEGIN TRANSACTION;
      DECLARE @outcome VARCHAR(20) = 'created';
      -- Range locks serialize per-user quota checks, including the first request.
      DECLARE @count INT = (SELECT COUNT(*) FROM dbo.AiLearning WITH (UPDLOCK,HOLDLOCK,INDEX(IX_AiLearning_UserDate)) WHERE UserId = @userId AND (ErrorCode IS NULL OR ErrorCode <> 'deleted'));
      IF EXISTS (SELECT 1 FROM dbo.AiLearning WHERE Id = @id AND UserId = @userId)
        SET @outcome = 'existing';
      ELSE IF EXISTS (SELECT 1 FROM dbo.AiLearning WHERE Id = @id)
        SET @outcome = 'conflict';
      ELSE IF @count >= 100 SET @outcome = 'library-full';
      ELSE IF EXISTS (SELECT 1 FROM dbo.AiLearning WHERE UserId = @userId AND Status IN ('queued','processing') AND CreatedAt >= DATEADD(hour,-24,SYSUTCDATETIME()))
        SET @outcome = 'busy';
      ELSE IF (SELECT COUNT(*) FROM dbo.AiLearning WHERE UserId = @userId AND CreatedAt >= DATEADD(day,-1,SYSUTCDATETIME())) >= 10
        SET @outcome = 'daily-limit';
      ELSE INSERT dbo.AiLearning (Id,UserId,Title,Status,RequestJson) VALUES (@id,@userId,@title,'queued',@request);
      COMMIT TRANSACTION;
      SELECT @outcome AS Outcome;`);
  const outcome = result.recordset[0]?.Outcome;
  if (outcome === "created" || outcome === "existing") return id;
  const messages: Record<string, string> = {
    "library-full": "Your library is full (100 items). Delete an item before creating another.",
    busy: "You already have a request waiting or generating. Wait for it to finish before sending another.",
    "daily-limit": "You have reached the limit of 10 requests in 24 hours. Please try again later.",
    conflict: "This request could not be created. Reload the page and try again.",
  };
  throw new StudioError(messages[outcome ?? ""] ?? "The generation request could not be confirmed.");
}

export async function deleteStudioItem(userId: string, id: string) {
  const pool = await getPool();
  // Keep the rate-limit record for 24 hours; discard all content immediately.
  await pool.request().input("userId", sql.NVarChar(255), userId).input("id", sql.UniqueIdentifier, id)
    .query(`UPDATE dbo.AiLearning SET Status='failed', Title=N'Deleted lesson', ContentJson=NULL,
      RequestJson=NULL, ErrorCode='deleted', LeaseToken=NULL, LeaseUntil=NULL
      WHERE UserId=@userId AND Id=@id;
      DELETE FROM dbo.AiLearning WHERE UserId=@userId AND Id=@id AND CreatedAt < DATEADD(day,-1,SYSUTCDATETIME());`);
}

export async function claimStudioJob(): Promise<{ id: string; leaseToken: string; request: AiRequest } | null> {
  const pool = await getPool();
  const leaseToken = randomUUID();
  const response = await pool.request().input("lease", sql.UniqueIdentifier, leaseToken)
    .query<{ Id: string; RequestJson: string }>(`
      SET XACT_ABORT ON;
      BEGIN TRANSACTION;
      DELETE FROM dbo.AiLearning WHERE ErrorCode='deleted' AND CreatedAt < DATEADD(day,-1,SYSUTCDATETIME());
      UPDATE dbo.AiLearning SET Status='failed', ErrorCode='expired', RequestJson=NULL, LeaseToken=NULL, LeaseUntil=NULL
      WHERE Status IN ('queued','processing') AND (CreatedAt < DATEADD(hour,-24,SYSUTCDATETIME()) OR (Attempts >= 2 AND LeaseUntil < SYSUTCDATETIME()));
      ;WITH candidate AS (
        SELECT TOP (1) * FROM dbo.AiLearning WITH (UPDLOCK,READPAST,READCOMMITTEDLOCK)
        WHERE (Status='queued' OR (Status='processing' AND LeaseUntil < SYSUTCDATETIME())) AND Attempts < 2
        ORDER BY CreatedAt,Id
      )
      UPDATE candidate SET Status='processing',LeaseToken=@lease,LeaseUntil=DATEADD(minute,5,SYSUTCDATETIME()),Attempts=Attempts+1
      OUTPUT INSERTED.Id,INSERTED.RequestJson;
      COMMIT TRANSACTION;`);
  const row = response.recordset[0];
  return row ? { id: row.Id.toLowerCase(), leaseToken, request: aiRequestSchema.parse(JSON.parse(row.RequestJson)) } : null;
}

export async function finishStudioJob(id: string, leaseToken: string, document: AiDocument | null) {
  const pool = await getPool();
  const current = await pool.request().input("id", sql.UniqueIdentifier, id).input("lease", sql.UniqueIdentifier, leaseToken)
    .query<{ RequestJson: string }>(`SELECT RequestJson FROM dbo.AiLearning WHERE Id=@id AND LeaseToken=@lease
      AND Status='processing' AND LeaseUntil >= SYSUTCDATETIME();`);
  if (!current.recordset[0]) throw new StudioError("The job lease has expired or the request no longer exists.");
  const request = aiRequestSchema.parse(JSON.parse(current.recordset[0].RequestJson));
  const validated = document ? parseAiDocument(document, request.questionCount) : null;
  const response = await pool.request().input("id", sql.UniqueIdentifier, id).input("lease", sql.UniqueIdentifier, leaseToken)
    .input("status", sql.VarChar(12), validated ? "ready" : "failed")
    .input("title", sql.NVarChar(120), validated?.title ?? "Generation unsuccessful")
    .input("content", sql.NVarChar(sql.MAX), validated ? JSON.stringify(validated) : null)
    .input("error", sql.VarChar(30), validated ? null : "model")
    .query(`UPDATE dbo.AiLearning SET Status=@status,Title=@title,ContentJson=@content,ErrorCode=@error,
      RequestJson=NULL,LeaseToken=NULL,LeaseUntil=NULL
      WHERE Id=@id AND LeaseToken=@lease AND Status='processing' AND LeaseUntil >= SYSUTCDATETIME();`);
  if (response.rowsAffected[0] !== 1) throw new StudioError("The job lease has expired or the request was deleted.");
}
