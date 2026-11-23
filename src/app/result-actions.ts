"use server";

import { ZodError } from "zod";
import { requireUser } from "@/lib/session";
import { saveResult, StorageError } from "@/lib/db";
import { scoreSubmission } from "@/lib/results";

export type SaveResponse = { ok: true; attemptId: string } | { ok: false; error: string };

export async function saveTestResult(input: unknown): Promise<SaveResponse> {
  const user = await requireUser();
  let scored: ReturnType<typeof scoreSubmission>;
  try {
    scored = scoreSubmission(input);
  } catch (error) {
    console.error("Invalid test submission:", error);
    if (error instanceof ZodError) return { ok: false, error: "The test data is not valid. Please start a new test." };
    if (error instanceof Error) return { ok: false, error: error.message };
    throw error;
  }
  try {
    await saveResult(user.id, scored.attemptId, scored.result);
    return { ok: true, attemptId: scored.attemptId };
  } catch (error) {
    console.error("Could not save test result:", error);
    return { ok: false, error: error instanceof StorageError ? error.message : "Your result could not be saved. Check the database connection and try saving again before leaving this page." };
  }
}
