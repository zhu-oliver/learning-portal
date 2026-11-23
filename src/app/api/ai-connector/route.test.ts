import { beforeEach, describe, expect, it, vi } from "vitest";
import { documentFixture } from "@/test/ai-fixture";
const mocks = vi.hoisted(() => ({ claim: vi.fn(), finish: vi.fn() }));
vi.mock("@/lib/ai-storage", () => ({ claimStudioJob: mocks.claim, finishStudioJob: mocks.finish, StudioError: class extends Error {} }));
const { POST } = await import("./route");
const token = "b".repeat(40);
const id = "10000000-0000-4000-8000-000000000001";
function request(body: unknown, authorization: string = `Bearer ${token}`) {
  return new Request("https://portal.example/api/ai-connector", {
    method: "POST", headers: { authorization }, body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("AI_CONNECTOR_TOKEN", token); });
describe("trusted connector API", () => {
  it("does not expose jobs to missing/wrong tokens or Google sessions alone", async () => {
    for (const auth of ["", "Bearer wrong", token]) expect((await POST(request({ action: "claim" }, auth))).status).toBe(401);
    expect(mocks.claim).not.toHaveBeenCalled();
    vi.stubEnv("AI_CONNECTOR_TOKEN", "");
    expect((await POST(request({ action: "claim" }))).status).toBe(401);
  });
  it("returns no owner identity and disables caching on claims", async () => {
    mocks.claim.mockResolvedValue(null);
    const response = await POST(request({ action: "claim" }));
    expect(await response.json()).toEqual({ job: null });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("validates type, version and bounded request size before touching storage", async () => {
    for (const body of ["invalid json", "x".repeat(65_000), { action: "claim", userId: "forged" }, { action: "finish", id, leaseToken: id, document: { ...documentFixture, schemaVersion: 2 } }]) {
      expect((await POST(request(body))).status).toBe(400);
    }
    expect(mocks.finish).not.toHaveBeenCalled();
  });
  it("accepts typed success/failure completions with a lease, not arbitrary job updates", async () => {
    mocks.finish.mockResolvedValue(undefined);
    expect((await POST(request({ action: "finish", id, leaseToken: id, document: documentFixture }))).status).toBe(200);
    expect(mocks.finish).toHaveBeenCalledWith(id, id, documentFixture);
    expect((await POST(request({ action: "finish", id, leaseToken: id, document: null }))).status).toBe(200);
  });
});
