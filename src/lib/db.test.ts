import { afterEach, describe, expect, it, vi } from "vitest";
import { scoreSubmission, summarizeResult } from "./results";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  requests: [] as { inputs: Record<string, unknown>; query: string }[],
  connect: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("mssql", () => ({
  default: {
    NVarChar: () => "nvarchar", UniqueIdentifier: "uuid", Int: "int", MAX: "max",
    ConnectionPool: class {
      on() { return this; }
      async connect() { mocks.connect(); return this; }
      request() {
        const inputs: Record<string, unknown> = {};
        const request = {
          input(name: string, _type: unknown, value: unknown) { inputs[name] = value; return request; },
          async query(query: string) {
            mocks.requests.push({ inputs, query });
            return mocks.query(query, inputs);
          },
        };
        return request;
      }
    },
  },
}));

const attemptId = "10000000-0000-4000-8000-000000000001";
const { result } = scoreSubmission({ kind: "quiz", attemptId, subject: "math", lesson: "fraction-detectives", answers: [1, 2, 0] });
const row = { AttemptId: attemptId, CompletedAt: new Date("2026-10-10T00:00:00Z"), ResultJson: JSON.stringify(summarizeResult(result)) };

async function loadDatabase(configured = true) {
  vi.resetModules();
  mocks.requests.length = 0;
  vi.stubEnv("SQL_SERVER", configured ? "example.database.windows.net" : "");
  vi.stubEnv("SQL_DATABASE", configured ? "portal" : "");
  return import("./db");
}

afterEach(() => vi.unstubAllEnvs());

describe("Azure SQL result storage", () => {
  it("reports missing configuration without pretending to save", async () => {
    const db = await loadDatabase(false);
    await expect(db.saveResult("user-a", attemptId, result)).rejects.toThrow("not connected");
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("parameterizes ownership and uses locking to make retries idempotent", async () => {
    const db = await loadDatabase();
    mocks.query.mockResolvedValue({ recordset: [row] });
    await db.saveResult("user-a", attemptId, result);
    await db.saveResult("user-a", attemptId, result);
    expect(mocks.connect).toHaveBeenCalledTimes(1);
    for (const request of mocks.requests) {
      expect(request.inputs.userId).toBe("user-a");
      expect(request.inputs.attemptId).toBe(attemptId);
      expect(request.query).toContain("UPDLOCK, HOLDLOCK");
      expect(request.query).toContain("BEGIN TRANSACTION");
      expect(request.query).not.toContain("user-a");
      expect(JSON.parse(String(request.inputs.json))).toEqual(summarizeResult(result));
      expect(String(request.inputs.json)).not.toMatch(/sections|items|prompt|answer|expected|explanation/);
    }
  });

  it("rejects changing an already saved attempt", async () => {
    const db = await loadDatabase();
    mocks.query.mockResolvedValue({ recordset: [{ ...row, ResultJson: JSON.stringify({ ...result, score: 0 }) }] });
    await expect(db.saveResult("user-a", attemptId, result)).rejects.toThrow("different score");
  });

  it("reads legacy answer detail and allows an unchanged final-score retry without rewriting history", async () => {
    const db = await loadDatabase();
    mocks.query.mockResolvedValue({ recordset: [{ ...row, ResultJson: JSON.stringify(result) }] });
    expect((await db.findResult("user-a", attemptId))?.result).toEqual(result);
    expect((await db.saveResult("user-a", attemptId, result)).result).toEqual(result);
  });

  it("stores only the final summary for every quiz kind, including mental math time", async () => {
    const db = await loadDatabase();
    const results = [
      result,
      scoreSubmission({ kind: "spelling", attemptId, listId: "custom", words: ["apple"], answers: ["apple"], vocabularyAnswers: [] }).result,
      scoreSubmission({ kind: "matching", attemptId, lesson: "animals", imageIds: ["cat", "dog", "rabbit", "bird", "fish", "horse", "cow", "pig", "sheep", "duck"] }).result,
      scoreSubmission({ kind: "mental-math", attemptId, activity: "single-digit-addition", rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [1, 2, 3, 4, 5], answers: Array<string>(40).fill(""), elapsedMs: 100000 }).result,
    ];
    mocks.query.mockImplementation(async (_query: string, inputs: Record<string, unknown>) => ({ recordset: [{ ...row, ResultJson: inputs.json }] }));
    for (const item of results) {
      const stored = await db.saveResult("user-a", attemptId, item);
      expect(stored.result).toEqual(summarizeResult(item));
      expect(stored.result).not.toHaveProperty("sections");
      if (item.kind === "mental-math") expect(stored.result.elapsedMs).toBe(100000);
    }
  });

  it("scopes detail, history and counts to the authenticated user", async () => {
    const db = await loadDatabase();
    mocks.query.mockImplementation(async (query: string, inputs: Record<string, unknown>) => {
      if (query.includes("COUNT(*)")) return { recordset: [{ Total: 1 }] };
      return { recordset: inputs.userId === "user-a" ? [row] : [] };
    });
    expect(await db.findResult("user-b", attemptId)).toBeUndefined();
    const history = await db.listResults("user-a", 2);
    expect(history.total).toBe(1);
    for (const request of mocks.requests) {
      expect(request.query).toContain("WHERE UserId = @userId");
    }
    expect(mocks.requests.find((request) => request.query.includes("OFFSET"))?.inputs.offset).toBe(20);
  });
});
