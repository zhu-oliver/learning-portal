import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ user: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/db", () => ({ saveResult: mocks.save, StorageError: class extends Error {} }));
import { saveTestResult } from "./result-actions";

const submission = { kind: "quiz", attemptId: "10000000-0000-4000-8000-000000000001", subject: "math", lesson: "fraction-detectives", answers: [1, 2, 0] };

describe("result save action", () => {
  beforeEach(() => {
    mocks.user.mockResolvedValue({ id: "authenticated-google-id" });
    mocks.save.mockResolvedValue({});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("uses the authenticated user and recomputes the score before saving", async () => {
    expect(await saveTestResult(submission)).toEqual({ ok: true, attemptId: submission.attemptId });
    expect(mocks.save).toHaveBeenCalledWith("authenticated-google-id", submission.attemptId, expect.objectContaining({ score: 3, total: 3 }));
  });

  it("rejects user IDs and scores supplied by the browser", async () => {
    expect(await saveTestResult({ ...submission, userId: "other-user", score: 3 })).toEqual({ ok: false, error: expect.any(String) });
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("saves mental math answer detail, score, and elapsed time for the authenticated account", async () => {
    const mentalMath = {
      kind: "mental-math", attemptId: submission.attemptId, activity: "single-digit-addition",
      rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [1, 2, 3, 4, 5],
      answers: ["2", ...Array<string>(39).fill("")], elapsedMs: 123456,
    };
    expect(await saveTestResult(mentalMath)).toEqual({ ok: true, attemptId: submission.attemptId });
    expect(mocks.save).toHaveBeenCalledWith("authenticated-google-id", submission.attemptId, expect.objectContaining({
      kind: "mental-math", score: 1, total: 40, elapsedMs: 123456, subject: "Math",
    }));
  });

  it("does not allow unauthenticated saves", async () => {
    mocks.user.mockRejectedValue(new Error("redirect:/"));
    await expect(saveTestResult(submission)).rejects.toThrow("redirect:/");
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("reports database failures without exposing internal details", async () => {
    mocks.save.mockRejectedValue(new Error("sensitive database internals"));
    const result = await saveTestResult(submission);
    expect(result).toEqual({ ok: false, error: expect.stringContaining("could not be saved") });
    expect(JSON.stringify(result)).not.toContain("sensitive");
  });
});
