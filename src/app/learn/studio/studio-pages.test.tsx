import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { documentFixture } from "@/test/ai-fixture";
import type { StudioItem } from "@/modules/ai-content";
import StudioPage from "./page";
import SavedStudioPage from "./[id]/page";

const mocks = vi.hoisted(() => ({ user: vi.fn(), list: vi.fn(), find: vi.fn(), studio: vi.fn(), viewer: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/ai-storage", () => ({ listStudioItems: mocks.list, findStudioItem: mocks.find }));
vi.mock("@/components/ai-studio", () => ({ AiStudio: mocks.studio }));
vi.mock("@/components/ai-lesson", () => ({ AiLesson: mocks.viewer }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));

const id = "10000000-0000-4000-8000-000000000001";
const item: StudioItem = { id, title: documentFixture.title, document: documentFixture, status: "ready", createdAt: "2026-11-06T00:00:00Z", error: null };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: "google:owner" });
  mocks.list.mockResolvedValue([{ ...item, document: null }]);
  mocks.find.mockResolvedValue(item);
  mocks.studio.mockImplementation(({ initialError }: { initialError?: string }) => <p>{initialError}</p>);
  mocks.viewer.mockImplementation(() => <p>Lesson viewer</p>);
});

describe("private Studio pages", () => {
  it("renders a dedicated owner-scoped lesson without loading or rendering the Studio library", async () => {
    render(await SavedStudioPage({ params: Promise.resolve({ id }) }));
    expect(mocks.find).toHaveBeenCalledWith("google:owner", id);
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.studio).not.toHaveBeenCalled();
    expect(mocks.viewer.mock.calls[0][0].lesson).toEqual(item);
    expect(screen.getByRole("link", { name: "Back to AI Learning Studio" })).toHaveAttribute("href", "/learn/studio");
  });
  it("rejects malformed or unavailable saved links", async () => {
    await expect(SavedStudioPage({ params: Promise.resolve({ id: "not-an-id" }) })).rejects.toThrow("NOT_FOUND");
    expect(mocks.find).not.toHaveBeenCalled();
    mocks.find.mockResolvedValue(null);
    await expect(SavedStudioPage({ params: Promise.resolve({ id }) })).rejects.toThrow("NOT_FOUND");
    expect(mocks.find).toHaveBeenCalledWith("google:owner", id);
  });
  it("selects only the signed-in owner's revision metadata, without sending the full lesson to the prompt page", async () => {
    render(await StudioPage({ searchParams: Promise.resolve({ revise: id }) }));
    expect(mocks.find).toHaveBeenCalledWith("google:owner", id);
    expect(mocks.studio.mock.calls[0][0].initialLesson).toEqual({ ...item, document: null });
  });
  it("reports unavailable revision links instead of selecting another account's lesson", async () => {
    mocks.find.mockResolvedValue(null);
    render(await StudioPage({ searchParams: Promise.resolve({ revise: id }) }));
    expect(screen.getByText("That saved lesson is not available in your account.")).toBeInTheDocument();
    expect(mocks.studio.mock.calls[0][0].initialLesson).toBeUndefined();
  });
});
