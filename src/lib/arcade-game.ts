import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { progressGames, progressGameSchema } from "@/modules/game-progress";

export const arcadeGames = {
  "math-army": { name: "Math Army", subject: "Math", subjectSlug: "math", description: "Steer through correct answers across eight arcade maths levels.", readySelector: ".lvbtn" },
  "math-kart": { name: "Math Kart", subject: "Math", subjectSlug: "math", description: "Race through maths gates, solo or in same-device two-player split screen.", readySelector: ".lv" },
  "code-commander": { name: "Code Commander", subject: "Math", subjectSlug: "math", description: "Program a tank with sequences, loops, and conditions across 25 missions.", readySelector: "#play" },
  "spelling-snake": { name: "Spelling Snake", subject: "Language & Reading", subjectSlug: "reading", description: "Listen to words and collect their letters across seven spelling levels.", readySelector: ".lvbtn" },
  "ecosystem-island": { name: "Ecosystem Island", subject: "Science", subjectSlug: "science", description: "Explore food webs in guided lessons, ten missions, and a sandbox.", readySelector: "#card [data-start]" },
  "time-traveler": { name: "Time Traveler", subject: "Science", subjectSlug: "science", description: "Explore 12 eras, solve challenges, and put historical events in order.", readySelector: "#play" },
  "map-quest": { name: "Map Quest", subject: "Science", subjectSlug: "science", description: "Explore the globe, answer geography clues, and collect passport stamps.", readySelector: "#play" },
  "fraction-factory": { name: "Fraction Factory", subject: "Math", subjectSlug: "math", description: "Slice and pack fractions for robots across 12 levels and Rush Mode.", readySelector: "#playBtn" },
  "typing-ninja": { name: "Typing Ninja", subject: "Language & Reading", subjectSlug: "reading", description: "Practise keyboard rows, capitals, words, and sentences across 12 levels.", readySelector: "#card [data-a='play']" },
  "planet-hopper": { name: "Planet Hopper", subject: "Science", subjectSlug: "science", description: "Fly a rocket around the solar system and discover planets, moons, and more.", readySelector: "#startBtn" },
};

export async function serveArcadeGame(slug: keyof typeof arcadeGames) {
  const user = (await auth())?.user;
  const userId = user?.id;
  const { name, subject } = arcadeGames[slug];
  const imageSources = slug === "planet-hopper" ? " https://thumb.wikimedia.org https://upload.wikimedia.org" : "";
  const styleSources = slug === "planet-hopper" ? "'self' 'unsafe-inline'" : "'unsafe-inline'";
  try {
    let html = await readFile(path.join(process.cwd(), "src", "games", slug, "index.html"), "utf8");
    if (["math-army", "math-kart", "code-commander", "spelling-snake", "map-quest", "planet-hopper"].includes(slug)) {
      html = html.replace("<html", `<html data-portal-sound-game="${slug}"`);
      html = html.replace("<head>", '<head><script src="/games/game-sound.js"></script>');
    }
    if (slug !== "planet-hopper") {
      const game = progressGameSchema.parse(slug);
      const progress = userId
        ? await (async () => {
          const { loadGameProgress } = await import("./game-progress");
          return loadGameProgress(userId, game);
        })()
        : { stars: [] };
      const ownerToken = userId ? (await import("./game-progress")).progressOwnerToken(userId, game) : undefined;
      const bootstrap = JSON.stringify({
        game, progress, spec: progressGames[game], guest: !userId,
        ...(ownerToken ? { ownerToken } : {}),
      }).replace(/</g, "\\u003c");
      html = html.replace("<head>", `<head><script>window.__portalProgress=${bootstrap};</script><script src="/games/account-progress.js"></script>`);
    }
    return new Response(html, { headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src ${styleSources}; img-src 'self' data: blob:${imageSources}; connect-src ${slug === "planet-hopper" ? "'none'" : "'self'"}; frame-ancestors 'self'; base-uri 'none'; form-action 'none'`,
    } });
  } catch (cause) {
    console.error(`${name} could not be loaded:`, cause instanceof Error ? cause.name : "Unknown error");
    return new Response(`${name} could not be loaded. Return to ${subject} and try again, or ask a parent to check the game deployment.`, {
      status: 500, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }
}
