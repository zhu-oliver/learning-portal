import { beforeEach, describe, expect, it, vi } from "vitest";
import { serveArcadeGame } from "./arcade-game";
import { loadGameProgress } from "./game-progress";

const mocks = vi.hoisted(() => ({ read: vi.fn(), user: vi.fn() }));
vi.mock("node:fs/promises", () => ({ readFile: mocks.read, default: { readFile: mocks.read } }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("./game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
beforeEach(() => vi.clearAllMocks());

describe("shared arcade game delivery", () => {
  it("injects account state before game scripts and escapes script-closing passport content", async () => {
    mocks.user.mockResolvedValue({ id: "google:child-a" });
    mocks.read.mockResolvedValue("<html><head></head><body><script>game()</script></body></html>");
    vi.mocked(loadGameProgress).mockResolvedValueOnce({ stars: [3], stamps: ["discovery:</script>"] });
    const response = await serveArcadeGame("map-quest");
    const html = await response.text();
    expect(loadGameProgress).toHaveBeenCalledWith("google:child-a", "map-quest");
    expect(html).toContain("discovery:\\u003c/script>");
    expect(html.indexOf("account-progress.js")).toBeLessThan(html.indexOf("game()"));
  });
  it("does not start a fresh game when loading account progress fails", async () => {
    mocks.user.mockResolvedValue({ id: "owner" });
    mocks.read.mockResolvedValue("<head></head>");
    vi.mocked(loadGameProgress).mockRejectedValueOnce(new Error("SQL unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await serveArcadeGame("math-army")).status).toBe(500);
  });
  it.each(["math-army", "math-kart", "spelling-snake", "code-commander", "ecosystem-island", "fraction-factory", "typing-ninja", "time-traveler", "map-quest", "planet-hopper"] as const)("reports a missing %s deployment explicitly", async (slug) => {
    mocks.user.mockResolvedValue({ id: "owner" });
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
  it("does not read a game file before authentication succeeds", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(serveArcadeGame("math-kart")).rejects.toThrow("AUTH_REDIRECT");
    expect(mocks.read).not.toHaveBeenCalled();
  });
});
