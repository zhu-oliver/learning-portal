import { readFile } from "node:fs/promises";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { progressGames, type GameProgress, type ProgressGame } from "@/modules/game-progress";

const script = await readFile(path.join(process.cwd(), "public", "games", "account-progress.js"), "utf8");
const origin = "https://portal.example";
function bridge(game: ProgressGame, progress: GameProgress = { stars: [] }, local: Record<string, string> = {}, guest = false) {
  const stored = new Map(Object.entries(local));
  const listeners = new Map<string, (event: unknown) => void>();
  const parent = { postMessage: vi.fn() };
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify({ progress: { stars: [3] } })));
  const window: {
    __portalProgress: unknown; localStorage: unknown; parent: typeof parent;
    addEventListener: (name: string, listener: (event: unknown) => void) => void;
    portalGameProgress?: { getItem(key: string): string; setItem(key: string, value: string): void; removeItem(key: string): void };
  } = {
    __portalProgress: { game, progress, spec: progressGames[game], ownerToken: guest ? undefined : "a".repeat(64), guest },
    localStorage: { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value), removeItem: (key: string) => stored.delete(key) },
    parent, addEventListener: (name, listener) => { listeners.set(name, listener); },
  };
  runInNewContext(script, { window, location: { origin }, fetch, setTimeout, clearTimeout, console });
  if (!window.portalGameProgress) throw new Error("Progress adapter missing.");
  return { storage: window.portalGameProgress, fetch, stored, parent, listeners,
    command: (action: string, source: unknown = parent, commandOrigin = origin) => listeners.get("message")?.({ source, origin: commandOrigin, data: { type: "little-oak-progress-command", action } }) };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("game progress browser bridge", () => {
  it("ignores legacy progress until explicit import while keeping settings local", async () => {
    const game = bridge("math-army", { stars: [] }, { mathArmyStars: "[3,2]", mathArmyGfx: "low" });
    expect(JSON.parse(game.storage.getItem("mathArmyStars")).every((stars: number) => stars === 0)).toBe(true);
    expect(game.storage.getItem("mathArmyGfx")).toBe("low");
    game.storage.setItem("mathArmyGfx", "high");
    await vi.advanceTimersByTimeAsync(500);
    expect(game.fetch).not.toHaveBeenCalled();
    game.command("import", {}, origin);
    game.command("import", game.parent, "https://other.example");
    expect(game.fetch).not.toHaveBeenCalled();
    game.command("import");
    await vi.advanceTimersByTimeAsync(500);
    expect(JSON.parse(String(game.fetch.mock.calls[0][1]?.body)).progress.stars.slice(0,2)).toEqual([3,2]);
    expect(game.stored.get("mathArmyStars")).toBe("[3,2]");
  });
  it("keeps guest progress in memory only, even when shared browser progress already exists", async () => {
    const game = bridge("math-army", { stars: [] }, { mathArmyStars: "[3,3]", mathArmyGfx: "low" }, true);
    expect(JSON.parse(game.storage.getItem("mathArmyStars")).every((stars: number) => stars === 0)).toBe(true);
    game.command("status");
    expect(game.parent.postMessage.mock.calls.at(-1)?.[0].legacyAvailable).toBe(false);
    game.storage.setItem("mathArmyStars", "[2]");
    await vi.advanceTimersByTimeAsync(500);
    expect(JSON.parse(game.storage.getItem("mathArmyStars"))[0]).toBe(2);
    expect(game.stored.get("mathArmyStars")).toBe("[3,3]");
    expect(game.stored.get("mathArmyGfx")).toBe("low");
    expect(game.fetch).not.toHaveBeenCalled();
    expect(game.parent.postMessage.mock.calls.at(-1)?.[0]).toMatchObject({
      state: "guest", message: "Progress is not saved while you are signed out.", legacyAvailable: false,
    });
    game.command("import");
    game.command("retry");
    await vi.advanceTimersByTimeAsync(1000);
    expect(game.fetch).not.toHaveBeenCalled();
    expect(JSON.parse(game.storage.getItem("mathArmyStars"))[0]).toBe(2);
  });
  it.each(["ecosystem-island", "time-traveler", "fraction-factory", "typing-ninja", "map-quest"] as const)("translates %s's progress without saving device settings", async gameName => {
    const game = bridge(gameName);
    if (gameName === "ecosystem-island") game.storage.setItem("ecoIsland.v1.stars", '{"1":3,"3":2}');
    if (gameName === "time-traveler") game.storage.setItem("timeTraveler_progress_v1", '{"stars":[2]}');
    if (gameName === "fraction-factory") game.storage.setItem("fractionFactorySave", '{"stars":[1],"coins":50,"rushBest":90,"all":true}');
    if (gameName === "typing-ninja") { game.storage.setItem("typingNinjaStars", "[3]"); game.storage.setItem("typingNinjaBest", "100"); }
    if (gameName === "map-quest") game.storage.setItem("mapquest-v1", '{"stars":[3],"unlocked":12,"coins":80,"stamps":["discovery:Canada"],"gfx":"low"}');
    await vi.advanceTimersByTimeAsync(500);
    const body = JSON.parse(String(game.fetch.mock.calls[0][1]?.body));
    expect(body.game).toBe(gameName);
    expect(body.progress.stars[0]).toBeGreaterThan(0);
    expect(body.progress).not.toHaveProperty("gfx");
    expect(body.progress).not.toHaveProperty("all");
    expect(body.progress).not.toHaveProperty("unlocked");
    if (gameName === "fraction-factory") expect(body.progress.best).toBe(90);
    if (gameName === "typing-ninja") expect(body.progress.best).toBe(100);
    if (gameName === "map-quest") expect(game.stored.get("mapquest-gfx")).toBe("low");
  });
  it("coalesces writes and preserves changes made during an in-flight save", async () => {
    const game = bridge("math-army");
    let resolve!: (value: Response) => void;
    game.fetch.mockReturnValueOnce(new Promise<Response>(done => { resolve = done; }));
    game.storage.setItem("mathArmyStars", "[1]");
    await vi.advanceTimersByTimeAsync(400);
    game.storage.setItem("mathArmyStars", "[3]");
    resolve(new Response(JSON.stringify({ progress: { stars: [1] } })));
    await vi.advanceTimersByTimeAsync(500);
    expect(game.fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(game.fetch.mock.calls[1][1]?.body)).progress.stars[0]).toBe(3);
    expect(JSON.parse(game.storage.getItem("mathArmyStars"))[0]).toBe(3);
  });
  it("keeps Map Quest graphics local, preserves legacy graphics only, and derives unlocks from account stars", async () => {
    const game = bridge("map-quest", { stars: [3] }, { "mapquest-v1": '{"stars":[3,3,3],"coins":800,"unlocked":12,"gfx":"low"}' });
    const loaded = JSON.parse(game.storage.getItem("mapquest-v1"));
    expect(loaded.gfx).toBe("low");
    expect(loaded.coins).toBe(0);
    expect(loaded.unlocked).toBe(2);
    game.storage.setItem("mapquest-v1", JSON.stringify({ ...loaded, gfx: "high" }));
    await vi.advanceTimersByTimeAsync(500);
    expect(game.fetch).not.toHaveBeenCalled();
    expect(game.stored.get("mapquest-gfx")).toBe("high");
  });
  it("reports failed saves, guards navigation, and retries without losing the snapshot", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const game = bridge("math-army");
    game.fetch.mockRejectedValueOnce(new Error("offline"));
    game.storage.setItem("mathArmyStars", "[3]");
    await vi.advanceTimersByTimeAsync(500);
    expect(game.parent.postMessage.mock.calls.at(-1)?.[0].state).toBe("error");
    const leaving = { preventDefault: vi.fn(), returnValue: undefined };
    game.listeners.get("beforeunload")?.(leaving);
    expect(leaving.preventDefault).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(game.fetch).toHaveBeenCalledOnce();
    game.command("retry");
    await vi.advanceTimersByTimeAsync(1);
    expect(game.parent.postMessage.mock.calls.at(-1)?.[0].state).toBe("saved");
    expect(game.fetch).toHaveBeenCalledTimes(2);
  });
  it("stops stale-account writes and requires reopening instead of endless retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const game = bridge("math-army");
    game.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: "The signed-in account changed." }), { status: 409 }));
    game.storage.setItem("mathArmyStars", "[3]");
    await vi.advanceTimersByTimeAsync(500);
    expect(game.parent.postMessage.mock.calls.at(-1)?.[0].reopenRequired).toBe(true);
    game.command("retry");
    await vi.advanceTimersByTimeAsync(500);
    expect(game.fetch).toHaveBeenCalledOnce();
  });
});
