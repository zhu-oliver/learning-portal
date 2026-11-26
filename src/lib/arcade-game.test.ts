import { beforeEach, describe, expect, it, vi } from "vitest";
import { serveArcadeGame } from "./arcade-game";
import { loadGameProgress } from "./game-progress";

const mocks = vi.hoisted(() => ({ read: vi.fn(), auth: vi.fn() }));
vi.mock("node:fs/promises", () => ({ readFile: mocks.read, default: { readFile: mocks.read } }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("./game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ user: { id: "google:owner" } }); });

describe("shared arcade game delivery", () => {
  it.each(["math-army", "math-kart", "code-commander", "spelling-snake", "map-quest", "planet-hopper"] as const)("loads sound controls before %s starts", async (slug) => {
    mocks.read.mockResolvedValue('<html lang="en"><head></head><body><script type="module">game()</script></body></html>');
    const html = await (await serveArcadeGame(slug)).text();
    expect(html).toContain(`data-portal-sound-game="${slug}"`);
    expect(html.indexOf("/games/game-sound.js")).toBeLessThan(html.indexOf("game()"));
  });
  it("injects account state before game scripts and escapes script-closing passport content", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "google:child-a" } });
    mocks.read.mockResolvedValue("<html><head></head><body><script>game()</script></body></html>");
    vi.mocked(loadGameProgress).mockResolvedValueOnce({ stars: [3], stamps: ["discovery:</script>"] });
    const response = await serveArcadeGame("map-quest");
    const html = await response.text();
    expect(loadGameProgress).toHaveBeenCalledWith("google:child-a", "map-quest");
    expect(html).toContain("discovery:\\u003c/script>");
    expect(html.indexOf("account-progress.js")).toBeLessThan(html.indexOf("game()"));
  });
  it("does not start a fresh game when loading account progress fails", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "owner" } });
    mocks.read.mockResolvedValue("<head></head>");
    vi.mocked(loadGameProgress).mockRejectedValueOnce(new Error("SQL unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await serveArcadeGame("math-army")).status).toBe(500);
  });
  it.each(["math-army", "math-kart", "spelling-snake", "code-commander", "ecosystem-island", "fraction-factory", "typing-ninja", "time-traveler", "map-quest", "planet-hopper"] as const)("reports a missing %s deployment explicitly", async (slug) => {
    mocks.auth.mockResolvedValue({ user: { id: "owner" } });
    mocks.read.mockRejectedValue(new Error("missing"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await serveArcadeGame(slug);
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const message = await response.text();
    expect(message).toContain("could not be loaded");
    expect(message).toContain(slug === "spelling-snake" || slug === "typing-ninja" ? "Return to Language & Reading" : ["ecosystem-island", "time-traveler", "map-quest", "planet-hopper"].includes(slug) ? "Return to Science" : "Return to Math");
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
  it("serves signed-out players in temporary guest mode without loading SQL or legacy progress", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    mocks.read.mockResolvedValue("<html><head></head><body><script>game()</script></body></html>");
    const response = await serveArcadeGame("math-kart");
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('"guest":true');
    expect(html).not.toContain("ownerToken");
    expect(loadGameProgress).not.toHaveBeenCalled();
  });
});
