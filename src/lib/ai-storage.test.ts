import { afterEach, describe, expect, it, vi } from "vitest";
import { documentFixture } from "@/test/ai-fixture";

const mocks = vi.hoisted(() => ({ query: vi.fn(), requests: [] as { inputs: Record<string, unknown>; query: string }[] }));
vi.mock("server-only", () => ({}));
vi.mock("./db", () => ({
  getPool: async () => ({ request: () => {
    const inputs: Record<string, unknown> = {};
    const request = {
      input(name: string, _type: unknown, value: unknown) { inputs[name] = value; return request; },
      query(query: string) { mocks.requests.push({ inputs, query }); return mocks.query(query, inputs); },
    };
    return request;
  } }),
}));
const { listStudioItems, findStudioItem, queueStudioItem, deleteStudioItem, claimStudioJob, finishStudioJob } = await import("./ai-storage");
const id = "10000000-0000-4000-8000-000000000001";
const lease = "20000000-0000-4000-8000-000000000002";
const request = { prompt: "Teach me about plants", grade: 4, questionCount: 1, previous: null };
const row = { Id: id, Title: documentFixture.title, Status: "ready", CreatedAt: new Date(), ContentJson: JSON.stringify(documentFixture), ErrorCode: null };
afterEach(() => { mocks.query.mockReset(); mocks.requests.length = 0; });

describe("private AI lesson storage", () => {
  it("normalizes SQL Server's uppercase GUIDs to browser request IDs for automatic completion", async () => {
    const mixedId = "ABCDEFAB-1234-4567-89AB-ABCDEFABCDEF";
    mocks.query.mockResolvedValueOnce({ recordset: [{ ...row, Id: mixedId }] });
    expect((await findStudioItem("owner", mixedId))?.id).toBe(mixedId.toLowerCase());
  });
  it("scopes list, read and deletion to the account and hides deleted content", async () => {
    mocks.query.mockImplementation(async (query: string, inputs: Record<string, unknown>) => ({
      recordset: query.startsWith("SELECT") && inputs.userId === "owner" ? [row] : [], rowsAffected: [1],
    }));
    expect((await findStudioItem("owner", id))?.document).toEqual(documentFixture);
    expect(await findStudioItem("intruder", id)).toBeUndefined();
    await listStudioItems("owner");
    await deleteStudioItem("owner", id);
    for (const operation of mocks.requests) {
      expect(operation.query).toMatch(/UserId\s*=\s*@userId/);
      expect(operation.inputs.userId).toBeTruthy();
      expect(operation.query).not.toContain("intruder");
    }
    expect(mocks.requests.at(-1)?.query).toContain("ContentJson=NULL");
    expect(mocks.requests.at(-1)?.query).toContain("LeaseToken=NULL");
  });
  it("enforces transactional daily/library/active limits and idempotent request IDs", async () => {
    mocks.query.mockResolvedValue({ recordset: [{ Outcome: "created" }] });
    expect(await queueStudioItem("owner", id, request)).toBe(id);
    const operation = mocks.requests[0];
    expect(operation.query).toContain("UPDLOCK,HOLDLOCK");
    expect(operation.query).toContain("BEGIN TRANSACTION");
    expect(operation.query).toContain("DATEADD(day,-1");
    expect(operation.inputs.userId).toBe("owner");
    expect(JSON.parse(String(operation.inputs.request))).toEqual(request);
    for (const outcome of ["busy", "daily-limit", "library-full", "conflict"]) {
      mocks.query.mockResolvedValueOnce({ recordset: [{ Outcome: outcome }] });
      await expect(queueStudioItem("owner", id, request)).rejects.toThrow();
    }
    mocks.query.mockResolvedValueOnce({ recordset: [{ Outcome: "existing" }] });
    expect(await queueStudioItem("owner", id, request)).toBe(id);
  });
  it("claims jobs atomically with bounded leases and no owner information", async () => {
    mocks.query.mockResolvedValueOnce({ recordset: [{ Id: id, RequestJson: JSON.stringify(request) }] });
    const job = await claimStudioJob();
    expect(job?.request).toEqual(request);
    expect(job).not.toHaveProperty("userId");
    const query = mocks.requests[0].query;
    expect(query).toContain("READPAST,READCOMMITTEDLOCK");
    expect(query).toContain("Attempts < 2");
    expect(query).toContain("DATEADD(minute,5");
    mocks.query.mockResolvedValueOnce({ recordset: [] });
    expect(await claimStudioJob()).toBeNull();
  });
  it("checks output count and valid live lease before publishing; clears prompt data", async () => {
    mocks.query.mockResolvedValueOnce({ recordset: [{ RequestJson: JSON.stringify(request) }] });
    mocks.query.mockResolvedValueOnce({ rowsAffected: [1] });
    await finishStudioJob(id, lease, documentFixture);
    expect(mocks.requests.at(-1)?.inputs.content).toBe(JSON.stringify(documentFixture));
    expect(mocks.requests.at(-1)?.query).toContain("RequestJson=NULL");
    expect(mocks.requests.at(-1)?.query).toContain("LeaseToken=@lease");
    mocks.query.mockResolvedValueOnce({ recordset: [] });
    await expect(finishStudioJob(id, lease, documentFixture)).rejects.toThrow("expired");
    mocks.query.mockResolvedValueOnce({ recordset: [{ RequestJson: JSON.stringify({ ...request, questionCount: 2 }) }] });
    await expect(finishStudioJob(id, lease, documentFixture)).rejects.toThrow("count");
  });
  it("rejects late completions after deletion or lease replacement", async () => {
    mocks.query.mockResolvedValueOnce({ recordset: [{ RequestJson: JSON.stringify(request) }] });
    mocks.query.mockResolvedValueOnce({ rowsAffected: [0] });
    await expect(finishStudioJob(id, lease, documentFixture)).rejects.toThrow("expired");
  });
  it("publishes and reloads all sections of a seven-item lesson and its revision context", async () => {
    const document = { ...documentFixture, sections: Array.from({ length: 7 }, (_, index) => ({ ...documentFixture.sections[0], heading: `Wonder ${index + 1}` })) };
    const revision = { ...request, previous: document };
    mocks.query.mockResolvedValueOnce({ recordset: [{ RequestJson: JSON.stringify(revision) }] });
    mocks.query.mockResolvedValueOnce({ rowsAffected: [1] });
    await finishStudioJob(id, lease, document);
    expect(JSON.parse(String(mocks.requests.at(-1)?.inputs.content)).sections).toHaveLength(7);
    mocks.query.mockResolvedValueOnce({ recordset: [{ ...row, ContentJson: JSON.stringify(document) }] });
    expect((await findStudioItem("owner", id))?.document).toEqual(document);
    mocks.query.mockResolvedValueOnce({ recordset: [{ Outcome: "created" }] });
    await queueStudioItem("owner", id, revision);
    expect(JSON.parse(String(mocks.requests.at(-1)?.inputs.request)).previous.sections).toHaveLength(7);
  });
});
