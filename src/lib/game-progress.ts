import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import sql from "mssql";
import { getPool } from "./db";
import { mergeGameProgress, parseGameProgress, type GameProgress, type ProgressGame } from "@/modules/game-progress";

export function progressOwnerToken(userId: string, slug: ProgressGame) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Account progress requires the configured authentication secret.");
  return createHmac("sha256", secret).update(JSON.stringify(["game-progress-v1", userId, slug])).digest("hex");
}

export function progressOwnerMatches(userId: string, slug: ProgressGame, token: string) {
  const expected = progressOwnerToken(userId, slug);
  return /^[a-f0-9]{64}$/.test(token) && timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(token, "hex"));
}

export async function loadGameProgress(userId: string, slug: ProgressGame): Promise<GameProgress> {
  const pool = await getPool();
  const result = await pool.request().input("userId", sql.NVarChar(255), userId).input("game", sql.VarChar(40), slug)
    .query<{ ProgressJson: string }>("SELECT ProgressJson FROM dbo.GameProgress WHERE UserId=@userId AND Game=@game;");
  return result.recordset[0] ? parseGameProgress(slug, JSON.parse(result.recordset[0].ProgressJson)) : { stars: [] };
}

export async function saveGameProgress(userId: string, slug: ProgressGame, incoming: GameProgress) {
  incoming = parseGameProgress(slug, incoming);
  const transaction = new sql.Transaction(await getPool());
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const request = () => new sql.Request(transaction).input("userId", sql.NVarChar(255), userId).input("game", sql.VarChar(40), slug);
    const existing = await request().query<{ ProgressJson: string }>(
      "SELECT ProgressJson FROM dbo.GameProgress WITH (UPDLOCK,HOLDLOCK) WHERE UserId=@userId AND Game=@game;");
    const current = existing.recordset[0] ? parseGameProgress(slug, JSON.parse(existing.recordset[0].ProgressJson)) : { stars: [] };
    const progress = parseGameProgress(slug, mergeGameProgress(current, incoming));
    await request().input("json", sql.NVarChar(sql.MAX), JSON.stringify(progress)).query(`
      IF EXISTS (SELECT 1 FROM dbo.GameProgress WHERE UserId=@userId AND Game=@game)
        UPDATE dbo.GameProgress SET ProgressJson=@json, UpdatedAt=SYSUTCDATETIME() WHERE UserId=@userId AND Game=@game;
      ELSE INSERT dbo.GameProgress (UserId,Game,ProgressJson) VALUES (@userId,@game,@json);
    `);
    await transaction.commit();
    return progress;
  } catch (cause) {
    try { await transaction.rollback(); }
    catch (rollbackError) { console.error("Game progress rollback failed:", rollbackError instanceof Error ? rollbackError.name : "Unknown error"); }
    throw cause;
  }
}
