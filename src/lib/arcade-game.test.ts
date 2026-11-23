import { beforeEach, describe, expect, it, vi } from "vitest";
import { serveArcadeGame } from "./arcade-game";

const mocks = vi.hoisted(() => ({ read: vi.fn(), user: vi.fn() }));
vi.mock("node:fs/promises", () => ({ readFile: mocks.read, default: { readFile: mocks.read } }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
beforeEach(() => vi.clearAllMocks());

describe("shared arcade game delivery", () => {
  it.each(["math-army", "math-kart", "spelling-snake", "code-commander"] as const)("reports a missing %s deployment explicitly", async (slug) => {
    mocks.user.mockResolvedValue({ id: "owner" });
    mocks.read.mockRejectedValue(new Error("missing"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await serveArcadeGame(slug);
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const message = await response.text();
    expect(message).toContain("could not be loaded");
    expect(message).toContain(slug === "spelling-snake" ? "Return to Language & Reading" : "Return to Math");
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
  it("does not read a game file before authentication succeeds", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(serveArcadeGame("math-kart")).rejects.toThrow("AUTH_REDIRECT");
    expect(mocks.read).not.toHaveBeenCalled();
  });
});
