import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), matches: vi.fn(), save: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/game-progress", () => ({ progressOwnerMatches: mocks.matches, saveGameProgress: mocks.save }));
const origin = "https://portal.example";
function request(body: unknown = { game: "math-army", ownerToken: "a".repeat(64), progress: { stars: [3] } }, requestOrigin = origin) {
  return new Request(`${origin}/api/game-progress`, { method: "POST", headers: { origin: requestOrigin }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.stubEnv("AUTH_URL", origin);
  mocks.auth.mockResolvedValue({ user: { id: "google:child-a" } });
  mocks.matches.mockReset().mockReturnValue(true);
  mocks.save.mockReset().mockResolvedValue({ stars: [3] });
});
afterEach(() => vi.unstubAllEnvs());

describe("game progress API", () => {
  it("requires authentication and same-origin requests", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(401);
    expect((await POST(request(undefined, "https://other.example"))).status).toBe(403);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("uses the configured public origin behind Azure's proxy", async () => {
    const proxied = new Request("http://127.0.0.1:8080/api/game-progress", {
      method: "POST", headers: { origin }, body: JSON.stringify({ game: "math-army", ownerToken: "a".repeat(64), progress: { stars: [2] } }),
    });
    expect((await POST(proxied)).status).toBe(200);
  });
  it("blocks stale iframe writes after another child signs in", async () => {
    mocks.matches.mockReturnValue(false);
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect((await response.json()).error).toMatch(/account changed/);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("bounds request bytes and rejects unknown games or another game's fields", async () => {
    for (const body of [{ game: "planet-hopper", ownerToken: "a".repeat(64), progress: { stars: [] } },
      { game: "math-army", ownerToken: "a".repeat(64), progress: { stars: [], coins: 2 } }, { padding: "x".repeat(64_001) }]) {
      expect((await POST(request(body))).status).toBe(400);
    }
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("returns the merged account snapshot privately, or an explicit retry error", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.save).toHaveBeenCalledWith("google:child-a", "math-army", { stars: [3] });
    expect(await response.json()).toEqual({ progress: { stars: [3] } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.save.mockRejectedValueOnce(new Error("SQL unavailable"));
    const failed = await POST(request());
    expect(failed.status).toBe(500);
    expect((await failed.json()).error).toMatch(/Retry saving/);
  });
});
