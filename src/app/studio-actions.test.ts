import { beforeEach, describe, expect, it, vi } from "vitest";
import { documentFixture } from "@/test/ai-fixture";

const mocks = vi.hoisted(() => ({ user: vi.fn(), queue: vi.fn(), find: vi.fn(), list: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/ai-storage", () => ({
  StudioError: class extends Error {}, queueStudioItem: mocks.queue, findStudioItem: mocks.find, listStudioItems: mocks.list, deleteStudioItem: mocks.remove,
}));
const { createStudioLesson, readStudioLesson, refreshStudioLibrary, removeStudioLesson } = await import("./studio-actions");
const id = "10000000-0000-4000-8000-000000000001";
const input = { requestId: id, prompt: "Teach me plants", grade: 4, questionCount: 1, previousId: null };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AI_CONNECTOR_TOKEN", "a".repeat(40));
  mocks.user.mockResolvedValue({ id: "google:owner" });
});
describe("authenticated Studio actions", () => {
  it("uses only the authenticated identity and rejects client-injected ownership", async () => {
    mocks.queue.mockResolvedValue(id);
    expect(await createStudioLesson(input)).toEqual({ ok: true, value: id });
    expect(mocks.queue).toHaveBeenCalledWith("google:owner", id, { prompt: input.prompt, grade: 4, questionCount: 1, previous: null });
    expect((await createStudioLesson({ ...input, userId: "google:intruder" })).ok).toBe(false);
    expect(mocks.queue).toHaveBeenCalledTimes(1);
  });
  it("does not include other accounts' saved lessons as model context", async () => {
    mocks.find.mockResolvedValue(undefined);
    expect((await createStudioLesson({ ...input, previousId: id })).ok).toBe(false);
    expect(mocks.find).toHaveBeenCalledWith("google:owner", id);
    expect(mocks.queue).not.toHaveBeenCalled();
    mocks.find.mockResolvedValue({ document: documentFixture });
    mocks.queue.mockResolvedValue(id);
    expect((await createStudioLesson({ ...input, previousId: id })).ok).toBe(true);
    expect(mocks.queue.mock.calls[0][2].previous).toEqual(documentFixture);
  });
  it("requires login for creating, reading, polling and deleting", async () => {
    mocks.user.mockRejectedValue(new Error("redirect:/"));
    for (const action of [() => createStudioLesson(input), () => readStudioLesson(id), () => refreshStudioLibrary(), () => removeStudioLesson(id)]) {
      await expect(action()).rejects.toThrow("redirect:/");
    }
    expect(mocks.queue).not.toHaveBeenCalled();
    expect(mocks.find).not.toHaveBeenCalled();
  });
  it("reports missing connector and unavailable storage without success-shaped responses", async () => {
    vi.stubEnv("AI_CONNECTOR_TOKEN", "");
    expect(await createStudioLesson(input)).toMatchObject({ ok: false, error: expect.stringContaining("not configured") });
    const logger = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      mocks.list.mockRejectedValue(new Error("private provider details"));
      expect(await refreshStudioLibrary()).toMatchObject({ ok: false, error: expect.not.stringContaining("private provider") });
    } finally { logger.mockRestore(); }
  });
});
