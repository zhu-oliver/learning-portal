import { describe, expect, it } from "vitest";
import { mergeGameProgress, parseGameProgress } from "./game-progress";

describe("account game progress", () => {
  it("keeps cumulative rewards and merges stale devices without duplicating retries", () => {
    const current = { stars: [3, 0, 1], coins: 80, best: 120, stamps: ["discovery:Canada", "0:1"] };
    const incoming = { stars: [1, 2], coins: 40, best: 140, stamps: ["0:1", "discovery:France"] };
    const merged = mergeGameProgress(current, incoming);
    expect(merged).toEqual({ stars: [3, 2, 1], coins: 80, best: 140, stamps: ["discovery:Canada", "0:1", "discovery:France"] });
    expect(mergeGameProgress(merged, incoming)).toEqual(merged);
    expect(mergeGameProgress({ stars: [], lastLevel: 4 }, { stars: [], lastLevel: 0 }).lastLevel).toBe(0);
  });
  it("rejects another game's fields, impossible levels, and oversized or malformed progress", () => {
    for (const value of [{ stars: [4] }, { stars: [-1] }, { stars: [1.5] }, { stars: [null] }, { stars: [], coins: 1 },
      { stars: [], lastLevel: 8 }, { stars: Array(9).fill(0) }, { stars: [], all: true }]) {
      expect(() => parseGameProgress("math-army", value)).toThrow();
    }
    expect(() => parseGameProgress("map-quest", { stars: [], stamps: Array(513).fill("0:0") })).toThrow();
    expect(() => parseGameProgress("fraction-factory", { stars: [], coins: 1_000_000_001 })).toThrow();
    expect(parseGameProgress("fraction-factory", { stars: [3], coins: 1, best: 2 })).toEqual({ stars: [3], coins: 1, best: 2 });
  });
  it("accepts actual passports but rejects malformed chapter keys and embedded newlines", () => {
    expect(parseGameProgress("map-quest", { stars: [], stamps: ["0:0", "11:7", "discovery:Île de France"] }).stamps).toHaveLength(3);
    for (const stamp of ["12:0", "0:8", "prefix0:1", "0:1suffix", "discovery:", "discovery:Canada\nextra"]) {
      expect(() => parseGameProgress("map-quest", { stars: [], stamps: [stamp] })).toThrow();
    }
  });
});
