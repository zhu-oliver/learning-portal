import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { documentFixture } from "@/test/ai-fixture";
import type { StudioItem } from "@/modules/ai-content";
import { AiStudio } from "./ai-studio";

const mocks = vi.hoisted(() => ({ create: vi.fn(), read: vi.fn(), refresh: vi.fn(), remove: vi.fn() }));
vi.mock("@/app/studio-actions", () => ({
  createStudioLesson: mocks.create, readStudioLesson: mocks.read, refreshStudioLibrary: mocks.refresh, removeStudioLesson: mocks.remove,
}));
vi.mock("./result-save", () => ({ ResultSave: () => { throw new Error("AI quiz attempts must not be persisted"); } }));
const id = "10000000-0000-4000-8000-000000000001";
const item: StudioItem = { id, title: documentFixture.title, document: documentFixture, status: "ready", createdAt: "2026-11-06T00:00:00Z", error: null };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({ ok: true, value: id });
  mocks.refresh.mockResolvedValue({ ok: true, value: [] });
  mocks.remove.mockResolvedValue({ ok: true, value: null });
});
afterEach(() => vi.useRealTimers());

describe("AI Learning Studio", () => {
  it("submits bounded prompts and shows durable queued status rather than fake generated content", async () => {
    const user = userEvent.setup();
    render(<AiStudio initialItems={[]} configured />);
    await user.type(screen.getByLabelText("What would you like to learn or change?"), "Teach me plants");
    await user.click(screen.getByRole("button", { name: "Create lesson & quiz" }));
    expect(mocks.create).toHaveBeenCalledWith({
      requestId: expect.any(String), prompt: "Teach me plants", grade: 4, questionCount: 5, previousId: null,
    });
    expect(screen.getByRole("log")).toHaveTextContent("Request queued");
    expect(screen.getByRole("status")).toHaveTextContent("Connecting to AI Model...");
    expect(screen.queryByRole("region", { name: "Generated learning content" })).not.toBeInTheDocument();
  });
  it("links to a separate saved lesson and preserves follow-up revisions without showing its content", async () => {
    const user = userEvent.setup();
    render(<AiStudio initialItems={[item]} initialLesson={item} configured />);
    expect(screen.getByText("2026-11-06 UTC")).toHaveAttribute("dateTime", item.createdAt);
    expect(screen.getByRole("link", { name: "Open lesson & quiz" })).toHaveAttribute("href", `/learn/studio/${id}`);
    expect(screen.queryByRole("heading", { name: "Energy in a food chain" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("What would you like to learn or change?"), "Make it about oceans");
    await user.click(screen.getByRole("button", { name: "Create revised lesson" }));
    expect(mocks.create.mock.calls[0][0].previousId).toBe(id);
  });
  it("restores pending feedback after reload and replaces it with a separate-page link on completion", async () => {
    vi.useFakeTimers();
    const queued: StudioItem = { ...item, document: null, status: "queued" };
    mocks.refresh.mockResolvedValue({ ok: true, value: [{ ...item, document: null }] });
    render(<AiStudio initialItems={[queued]} configured />);
    expect(screen.getByRole("status")).toHaveTextContent("Connecting to AI Model...");
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(mocks.read).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Open completed lesson & quiz" })).toHaveAttribute("href", `/learn/studio/${id}`);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("log")).toHaveTextContent("is saved");
  });
  it("does not claim success on generation or library errors and preserves the prompt", async () => {
    const user = userEvent.setup();
    mocks.create.mockResolvedValue({ ok: false, error: "Local connector is not configured" });
    render(<AiStudio initialItems={[]} configured />);
    await user.type(screen.getByLabelText("What would you like to learn or change?"), "Teach me plants");
    await user.click(screen.getByRole("button", { name: "Create lesson & quiz" }));
    expect(screen.getByRole("alert")).toHaveTextContent("not configured");
    expect(screen.getByLabelText("What would you like to learn or change?")).toHaveValue("Teach me plants");
    expect(screen.getByRole("log")).not.toHaveTextContent("Request queued");
  });
  it("preserves the selected revision while a different request is pending", async () => {
    vi.useFakeTimers();
    const queued: StudioItem = { ...item, id: "20000000-0000-4000-8000-000000000002", document: null, status: "queued" };
    mocks.refresh.mockResolvedValue({ ok: true, value: [{ ...item, document: null }, queued] });
    render(<AiStudio initialItems={[item, queued]} initialLesson={item} configured />);
    await act(async () => { await vi.advanceTimersByTimeAsync(20_000); });
    expect(screen.getByRole("link", { name: "Open completed lesson & quiz" })).toHaveAttribute("href", `/learn/studio/${id}`);
    expect(mocks.read).not.toHaveBeenCalled();
    expect(screen.getByRole("log")).not.toHaveTextContent("is saved");
  });
  it("requires confirmation to delete and removes only the selected account item", async () => {
    const user = userEvent.setup();
    render(<AiStudio initialItems={[item]} initialLesson={item} configured />);
    await user.click(screen.getByRole("button", { name: "Delete item" }));
    expect(mocks.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith(id));
    expect(screen.queryByRole("region", { name: "Generated learning content" })).not.toBeInTheDocument();
  });
  it("keeps existing lessons usable while unconfigured but disables generation", () => {
    render(<AiStudio initialItems={[item]} initialLesson={item} configured={false} />);
    expect(screen.getByRole("button", { name: "Create revised lesson" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Open lesson & quiz" })).toHaveAttribute("href", `/learn/studio/${id}`);
  });
  it("shows active generation then an explicit failure, never an endless spinner", async () => {
    vi.useFakeTimers();
    const processing: StudioItem = { ...item, document: null, status: "processing" };
    mocks.refresh.mockResolvedValue({ ok: true, value: [{ ...processing, status: "failed", error: "The model was unavailable. Try again." }] });
    render(<AiStudio initialItems={[processing]} configured />);
    expect(screen.getByRole("status")).toHaveTextContent("Generating Lesson...");
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(screen.getByRole("status")).toHaveTextContent("model was unavailable");
    expect(document.querySelector(".generation-status")).toBeNull();
  });
  it("can select a library item for revision without loading its lesson inline", async () => {
    const user = userEvent.setup();
    render(<AiStudio initialItems={[{ ...item, document: null }]} configured />);
    await user.click(screen.getByRole("button", { name: "Revise lesson" }));
    await user.type(screen.getByLabelText("What would you like to learn or change?"), "Add examples");
    await user.click(screen.getByRole("button", { name: "Create revised lesson" }));
    expect(mocks.create.mock.calls[0][0].previousId).toBe(id);
    expect(mocks.read).not.toHaveBeenCalled();
  });
});
