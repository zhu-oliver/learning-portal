import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/session";

export const arcadeGames = {
  "math-army": { name: "Math Army", subject: "Math", subjectSlug: "math", description: "Steer through correct answers across eight arcade maths levels." },
  "math-kart": { name: "Math Kart", subject: "Math", subjectSlug: "math", description: "Race through maths gates, solo or in same-device two-player split screen." },
  "code-commander": { name: "Code Commander", subject: "Math", subjectSlug: "math", description: "Program a tank with sequences, loops, and conditions across 25 missions." },
  "spelling-snake": { name: "Spelling Snake", subject: "Language & Reading", subjectSlug: "reading", description: "Listen to words and collect their letters across seven spelling levels." },
  "ecosystem-island": { name: "Ecosystem Island", subject: "Science", subjectSlug: "science", description: "Build habitats and watch food webs through ten missions and a sandbox." },
  "time-traveler": { name: "Time Traveler", subject: "Science", subjectSlug: "science", description: "Explore 12 eras, solve challenges, and put historical events in order." },
  "map-quest": { name: "Map Quest", subject: "Science", subjectSlug: "science", description: "Explore the globe, answer geography clues, and collect passport stamps." },
  "fraction-factory": { name: "Fraction Factory", subject: "Math", subjectSlug: "math", description: "Slice and pack fractions for robots across 12 levels and Rush Mode." },
  "typing-ninja": { name: "Typing Ninja", subject: "Language & Reading", subjectSlug: "reading", description: "Practise keyboard rows, capitals, words, and sentences across 12 levels." },
  "planet-hopper": { name: "Planet Hopper", subject: "Science", subjectSlug: "science", description: "Fly a rocket around the solar system and discover planets, moons, and more." },
};

export async function serveArcadeGame(slug: keyof typeof arcadeGames) {
  await requireUser();
  const { name, subject } = arcadeGames[slug];
  const imageSources = slug === "planet-hopper" ? " https://thumb.wikimedia.org https://upload.wikimedia.org" : "";
  const styleSources = slug === "planet-hopper" ? "'self' 'unsafe-inline'" : "'unsafe-inline'";
  try {
    const html = await readFile(path.join(process.cwd(), "src", "games", slug, "index.html"), "utf8");
    return new Response(html, { headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src ${styleSources}; img-src 'self' data: blob:${imageSources}; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'`,
    } });
  } catch (cause) {
    console.error(`${name} could not be loaded:`, cause instanceof Error ? cause.name : "Unknown error");
    return new Response(`${name} could not be loaded. Return to ${subject} and try again, or ask a parent to check the game deployment.`, {
      status: 500, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }
}
