import { z } from "zod";

export const progressGames = {
  "math-army": { levels: 8, starKey: "mathArmyStars", lastKey: "mathArmyLast" },
  "math-kart": { levels: 8, starKey: "mathKartStars" },
  "code-commander": { levels: 25, starKey: "codeCommanderStars" },
  "spelling-snake": { levels: 7, starKey: "spellingSnakeStars", lastKey: "spellingSnakeLast" },
  "ecosystem-island": { levels: 10, starKey: "ecoIsland.v1.stars", objectStars: true },
  "time-traveler": { levels: 12, containerKey: "timeTraveler_progress_v1" },
  "fraction-factory": { levels: 12, containerKey: "fractionFactorySave", coins: true, bestField: "rushBest" },
  "typing-ninja": { levels: 12, starKey: "typingNinjaStars", bestKey: "typingNinjaBest" },
  "map-quest": { levels: 12, containerKey: "mapquest-v1", coins: true, stamps: true },
};
export type ProgressGame = keyof typeof progressGames;
export const progressGameSchema = z.enum([
  "math-army", "math-kart", "code-commander", "spelling-snake", "ecosystem-island",
  "time-traveler", "fraction-factory", "typing-ninja", "map-quest",
]);
export const gameProgressSchema = z.object({
  stars: z.array(z.number().int().min(0).max(3)).max(25),
  coins: z.number().int().min(0).max(1_000_000_000).optional(),
  best: z.number().int().min(0).max(1_000_000_000).optional(),
  stamps: z.array(z.string().min(1).max(120)).max(512).optional(),
  lastLevel: z.number().int().min(0).max(24).optional(),
}).strict();
export type GameProgress = z.infer<typeof gameProgressSchema>;

export function parseGameProgress(slug: ProgressGame, value: unknown): GameProgress {
  const progress = gameProgressSchema.parse(value);
  const spec = progressGames[slug];
  if (progress.stars.length > spec.levels
    || (progress.coins !== undefined && !("coins" in spec))
    || (progress.best !== undefined && !("bestField" in spec || "bestKey" in spec))
    || (progress.stamps !== undefined && !("stamps" in spec))
    || (progress.lastLevel !== undefined && (!("lastKey" in spec) || progress.lastLevel >= spec.levels))) {
    throw new Error("Progress fields do not match this game.");
  }
  if (progress.stamps?.some(stamp => !/^(?:discovery:.+|(?:[0-9]|1[01]):[0-7])$/.test(stamp))) {
    throw new Error("Invalid passport stamp.");
  }
  return progress;
}

export function mergeGameProgress(current: GameProgress, incoming: GameProgress): GameProgress {
  const result: GameProgress = {
    stars: Array.from({ length: Math.max(current.stars.length, incoming.stars.length) },
      (_, index) => Math.max(current.stars[index] || 0, incoming.stars[index] || 0)),
  };
  for (const key of ["coins", "best"] as const) {
    if (current[key] !== undefined || incoming[key] !== undefined) result[key] = Math.max(current[key] || 0, incoming[key] || 0);
  }
  if (current.stamps || incoming.stamps) result.stamps = [...new Set([...(current.stamps || []), ...(incoming.stamps || [])])];
  if (incoming.lastLevel !== undefined || current.lastLevel !== undefined) result.lastLevel = incoming.lastLevel ?? current.lastLevel;
  return result;
}
