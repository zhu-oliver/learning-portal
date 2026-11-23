import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { progressOwnerMatches, saveGameProgress } from "@/lib/game-progress";
import { gameProgressSchema, parseGameProgress, progressGameSchema } from "@/modules/game-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const inputSchema = z.object({ game: progressGameSchema, ownerToken: z.string().regex(/^[a-f0-9]{64}$/), progress: gameProgressSchema }).strict();

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing progress.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 64_000) { await reader.cancel(); throw new Error("Progress too large."); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in again before saving game progress." }, { status: 401 });
  if (request.headers.get("origin") !== new URL(process.env.AUTH_URL || request.url).origin) {
    return NextResponse.json({ error: "Game progress must be saved from this website." }, { status: 403 });
  }
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBody(request));
    parseGameProgress(input.game, input.progress);
  } catch {
    return NextResponse.json({ error: "This game sent invalid progress. Reload the game and try again." }, { status: 400 });
  }
  try {
    if (!progressOwnerMatches(session.user.id, input.game, input.ownerToken)) {
      return NextResponse.json({ error: "The signed-in account changed. Reopen the game before playing or saving." }, { status: 409 });
    }
    const progress = await saveGameProgress(session.user.id, input.game, input.progress);
    return NextResponse.json({ progress }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (cause) {
    console.error("Game progress save failed:", cause instanceof Error ? cause.name : "Unknown error");
    return NextResponse.json({ error: "Game progress could not be saved. Keep this game open and try Retry saving." }, { status: 500 });
  }
}
