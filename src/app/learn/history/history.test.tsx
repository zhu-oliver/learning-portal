import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { scoreSubmission, summarizeResult } from "@/lib/results";

const mocks = vi.hoisted(() => ({
  user: vi.fn(), list: vi.fn(), find: vi.fn(),
  notFound: vi.fn((): never => { throw new Error("not-found"); }),
}));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/db", () => ({
  HISTORY_PAGE_SIZE: 20, listResults: mocks.list, findResult: mocks.find,
  StorageError: class extends Error {},
}));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import HistoryPage from "./page";
import SavedResultPage from "./[attempt]/page";

const attempt = "10000000-0000-4000-8000-000000000001";
const { result } = scoreSubmission({ kind: "quiz", attemptId: attempt, subject: "math", lesson: "fraction-detectives", answers: [1, 2, 0] });
const stored = { attemptId: attempt, completedAt: new Date("2026-10-10T00:00:00Z"), result };

describe("private history pages", () => {
  beforeEach(() => {
    mocks.user.mockResolvedValue({ id: "user-a" });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("loads the signed-in user's history with pagination", async () => {
    mocks.list.mockResolvedValue({ results: [stored], total: 21 });
    render(await HistoryPage({ searchParams: Promise.resolve({}) }));
    expect(mocks.list).toHaveBeenCalledWith("user-a", 1);
    expect(screen.getByRole("link", { name: /fraction detectives/i })).toHaveAttribute("href", `/learn/history/${attempt}`);
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/learn/history?page=2");
  });

  it("shows a storage failure rather than an empty history", async () => {
    mocks.list.mockRejectedValue(new Error("database offline"));
    render(await HistoryPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");
    expect(screen.queryByText(/No saved results/)).not.toBeInTheDocument();
  });

  it("returns not-found for another user's result and validates attempt IDs", async () => {
    mocks.find.mockResolvedValue(undefined);
    await expect(SavedResultPage({ params: Promise.resolve({ attempt }) })).rejects.toThrow("not-found");
    expect(mocks.find).toHaveBeenCalledWith("user-a", attempt);
    mocks.find.mockClear();
    await expect(SavedResultPage({ params: Promise.resolve({ attempt: "bad-id" }) })).rejects.toThrow("not-found");
    expect(mocks.find).not.toHaveBeenCalled();
  });

  it("renders stored answer detail and UTC completion time", async () => {
    mocks.find.mockResolvedValue(stored);
    render(await SavedResultPage({ params: Promise.resolve({ attempt }) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Fraction detectives");
    expect(screen.getByText("Completed 2026-10-10 00:00:00 UTC")).toBeInTheDocument();
    expect(screen.getByText(/Your answer: 5\/7/)).toBeInTheDocument();
  });

  it("shows stored mental math score and time without storing answers", async () => {
    const mentalMath = scoreSubmission({
      kind: "mental-math", attemptId: attempt, activity: "single-digit-addition",
      rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [1, 2, 3, 4, 5],
      answers: ["2", ...Array<string>(39).fill("")], elapsedMs: 65432,
    }).result;
    const saved = { ...stored, result: summarizeResult(mentalMath) };
    mocks.list.mockResolvedValue({ results: [saved], total: 1 });
    const { unmount } = render(await HistoryPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Time taken: 1:06")).toBeInTheDocument();
    expect(screen.getByText("1 / 40")).toBeInTheDocument();
    unmount();
    mocks.find.mockResolvedValue(saved);
    render(await SavedResultPage({ params: Promise.resolve({ attempt }) }));
    expect(screen.getByText("1:06")).toBeInTheDocument();
    expect(screen.queryByText(/Your answer/)).not.toBeInTheDocument();
    expect(screen.getByText(/Only the final score and time taken was saved/)).toBeInTheDocument();
  });

  it("blocks anonymous history and rejects invalid pages", async () => {
    mocks.user.mockRejectedValueOnce(new Error("login-required"));
    await expect(HistoryPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("login-required");
    expect(mocks.list).not.toHaveBeenCalled();
    await expect(HistoryPage({ searchParams: Promise.resolve({ page: "-1" }) })).rejects.toThrow("not-found");
  });
});
