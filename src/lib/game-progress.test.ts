import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(), begin: vi.fn(), commit: vi.fn(), rollback: vi.fn(),
  operations: [] as { query: string; inputs: Record<string, unknown> }[],
}));
vi.mock("server-only", () => ({}));
vi.mock("mssql", () => {
  class Request {
    inputs: Record<string, unknown> = {};
    input(name: string, _type: unknown, value: unknown) { this.inputs[name] = value; return this; }
    query(query: string) { mocks.operations.push({ query, inputs: this.inputs }); return mocks.query(query, this.inputs); }
  }
  class Transaction {
    begin = mocks.begin;
    commit = mocks.commit;
    rollback = mocks.rollback;
  }
  return { default: { Request, Transaction, NVarChar: () => "nvarchar", VarChar: () => "varchar", MAX: "max", ISOLATION_LEVEL: { SERIALIZABLE: 4 } } };
});
vi.mock("./db", async () => {
  const { default: sql } = await import("mssql");
  return { getPool: async () => ({ request: () => new sql.Request() }) };
});
const { loadGameProgress, saveGameProgress, progressOwnerMatches, progressOwnerToken } = await import("./game-progress");
beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "test-only-account-progress-secret");
  mocks.query.mockReset();
  mocks.begin.mockReset();
  mocks.commit.mockReset();
  mocks.rollback.mockReset();
  mocks.operations.length = 0;
});
afterEach(() => vi.unstubAllEnvs());

describe("private SQL game progress", () => {
  it("binds iframe writes to both the account and game", () => {
    const token = progressOwnerToken("google:child-a", "math-army");
    expect(progressOwnerMatches("google:child-a", "math-army", token)).toBe(true);
    expect(progressOwnerMatches("google:child-b", "math-army", token)).toBe(false);
    expect(progressOwnerMatches("google:child-a", "math-kart", token)).toBe(false);
    expect(progressOwnerMatches("google:child-a", "math-army", "invalid")).toBe(false);
    vi.stubEnv("AUTH_SECRET", "");
    expect(() => progressOwnerToken("owner", "math-army")).toThrow();
  });
  it("uses owner-scoped reads and never treats database failure as empty progress", async () => {
    mocks.query.mockImplementation(async (_query: string, inputs: Record<string, unknown>) => ({
      recordset: inputs.userId === "child-a" ? [{ ProgressJson: '{"stars":[3]}' }] : [],
    }));
    expect(await loadGameProgress("child-a", "math-army")).toEqual({ stars: [3] });
    expect(await loadGameProgress("child-b", "math-army")).toEqual({ stars: [] });
    for (const operation of mocks.operations) {
      expect(operation.query).toContain("UserId=@userId AND Game=@game");
      expect(operation.inputs.game).toBe("math-army");
    }
    mocks.query.mockRejectedValueOnce(new Error("SQL unavailable"));
    await expect(loadGameProgress("child-a", "math-army")).rejects.toThrow("SQL unavailable");
  });
  it("locks, merges, and parameterizes writes before committing", async () => {
    mocks.query.mockResolvedValueOnce({ recordset: [{ ProgressJson: '{"stars":[3,0],"coins":80,"stamps":["0:0"]}' }] });
    mocks.query.mockResolvedValueOnce({ rowsAffected: [1] });
    expect(await saveGameProgress("child-a", "map-quest", { stars: [1,2], coins: 40, stamps: ["0:0", "1:0"] }))
      .toEqual({ stars: [3,2], coins: 80, stamps: ["0:0", "1:0"] });
    expect(mocks.begin).toHaveBeenCalledWith(4);
    expect(mocks.operations[0].query).toContain("UPDLOCK,HOLDLOCK");
    expect(mocks.operations[1].inputs).toEqual({ userId: "child-a", game: "map-quest", json: '{"stars":[3,2],"coins":80,"stamps":["0:0","1:0"]}' });
    expect(mocks.operations[1].query).not.toContain("child-a");
    expect(mocks.commit).toHaveBeenCalledOnce();
    expect(mocks.rollback).not.toHaveBeenCalled();
  });
  it("rolls back failed saves rather than acknowledging lost progress", async () => {
    mocks.query.mockResolvedValueOnce({ recordset: [] }).mockRejectedValueOnce(new Error("write failed"));
    await expect(saveGameProgress("child-a", "math-army", { stars: [1] })).rejects.toThrow("write failed");
    expect(mocks.rollback).toHaveBeenCalledOnce();
    expect(mocks.commit).not.toHaveBeenCalled();
  });
});
