"use server";

import { z } from "zod";
import { requireUser } from "@/lib/session";
import { deleteStudioItem, findStudioItem, listStudioItems, queueStudioItem, StudioError } from "@/lib/ai-storage";
import { studioCreateSchema, type StudioItem } from "@/modules/ai-content";

type Reply<T> = { ok: true; value: T } | { ok: false; error: string };
function failure(cause: unknown): { ok: false; error: string } {
  if (cause instanceof StudioError) return { ok: false, error: cause.message };
  console.error("AI Studio storage operation failed:", cause instanceof Error ? cause.name : "Unknown error");
  return { ok: false, error: "AI Studio could not reach its storage. Please retry. A parent may need to check the database setup." };
}

export async function createStudioLesson(input: unknown): Promise<Reply<string>> {
  const user = await requireUser();
  const parsed = studioCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a learning prompt (up to 2,000 characters), a grade from 1 to 8, and 1 to 10 questions." };
  if (!process.env.AI_CONNECTOR_TOKEN || process.env.AI_CONNECTOR_TOKEN.length < 32) {
    return { ok: false, error: "The local AI connector is not configured yet. A parent needs to complete the LM Studio setup." };
  }
  try {
    const request = parsed.data;
    const previous = request.previousId ? await findStudioItem(user.id, request.previousId) : undefined;
    if (request.previousId && !previous?.document) return { ok: false, error: "That saved lesson is not available in your account." };
    const id = await queueStudioItem(user.id, request.requestId, {
      prompt: request.prompt, grade: request.grade, questionCount: request.questionCount, previous: previous?.document ?? null,
    });
    return { ok: true, value: id };
  } catch (cause) {
    return failure(cause);
  }
}

export async function refreshStudioLibrary(): Promise<Reply<StudioItem[]>> {
  const user = await requireUser();
  try {
    return { ok: true, value: await listStudioItems(user.id) };
  } catch (cause) { return failure(cause); }
}

export async function readStudioLesson(input: unknown): Promise<Reply<StudioItem>> {
  const user = await requireUser();
  const id = z.uuid().safeParse(input);
  if (!id.success) return { ok: false, error: "Choose a valid saved lesson." };
  try {
    const lesson = await findStudioItem(user.id, id.data);
    return lesson ? { ok: true, value: lesson } : { ok: false, error: "This lesson is not available in your account." };
  } catch (cause) { return failure(cause); }
}

export async function removeStudioLesson(input: unknown): Promise<Reply<null>> {
  const user = await requireUser();
  const id = z.uuid().safeParse(input);
  if (!id.success) return { ok: false, error: "Choose a valid saved lesson." };
  try {
    await deleteStudioItem(user.id, id.data);
    return { ok: true, value: null };
  } catch (cause) { return failure(cause); }
}
