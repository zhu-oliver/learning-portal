import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { NextResponse } from "next/server";
import { claimStudioJob, finishStudioJob, StudioError } from "@/lib/ai-storage";
import { aiDocumentSchema } from "@/modules/ai-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const messageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("claim") }).strict(),
  z.object({ action: z.literal("finish"), id: z.uuid(), leaseToken: z.uuid(), document: aiDocumentSchema.nullable() }).strict(),
]);
function authorized(request: Request) {
  const expected = process.env.AI_CONNECTOR_TOKEN;
  const actual = request.headers.get("authorization");
  if (!expected || expected.length < 32 || !actual || actual.length > 512) return false;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(actual), hash(`Bearer ${expected}`));
}

async function boundedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 64_000) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized connector." }, { status: 401 });
  let input: z.infer<typeof messageSchema>;
  try {
    input = messageSchema.parse(await boundedBody(request));
  } catch {
    return NextResponse.json({ error: "Invalid connector payload." }, { status: 400 });
  }
  try {
    if (input.action === "claim") return NextResponse.json({ job: await claimStudioJob() }, { headers: { "Cache-Control": "no-store" } });
    await finishStudioJob(input.id, input.leaseToken, input.document);
    return NextResponse.json({ ok: true });
  } catch (cause) {
    if (cause instanceof StudioError) return NextResponse.json({ error: cause.message }, { status: 409 });
    console.error("AI connector operation failed:", cause instanceof Error ? cause.name : "Unknown error");
    return NextResponse.json({ error: "The connector could not process this request. Check the schema, question count, and database setup." }, { status: 500 });
  }
}
