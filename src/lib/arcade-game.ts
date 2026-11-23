import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/session";

const games = {
  "math-army": { name: "Math Army", subject: "Math" },
  "math-kart": { name: "Math Kart", subject: "Math" },
  "code-commander": { name: "Code Commander", subject: "Math" },
  "spelling-snake": { name: "Spelling Snake", subject: "Language & Reading" },
};

export async function serveArcadeGame(slug: keyof typeof games) {
  await requireUser();
  const { name, subject } = games[slug];
  try {
    const html = await readFile(path.join(process.cwd(), "src", "games", slug, "index.html"), "utf8");
    return new Response(html, { headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
    } });
  } catch (cause) {
    console.error(`${name} could not be loaded:`, cause instanceof Error ? cause.name : "Unknown error");
    return new Response(`${name} could not be loaded. Return to ${subject} and try again, or ask a parent to check the game deployment.`, {
      status: 500, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }
}
