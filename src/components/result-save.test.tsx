import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultSave } from "./result-save";
import type { TestAnswers } from "@/lib/results";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("@/app/result-actions", () => ({ saveTestResult: mocks.save }));

const submission: TestAnswers = { kind: "quiz", subject: "math", lesson: "fraction-detectives", answers: [1, 2, 0] };

describe("result saving", () => {
  it("automatically saves and links the saved result", async () => {
    mocks.save.mockImplementation(async (input) => ({ ok: true, attemptId: input.attemptId }));
    render(<ResultSave submission={submission} />);
    const link = await screen.findByRole("link", { name: "View saved result" });
    expect(link).toHaveAttribute("href", `/learn/history/${mocks.save.mock.calls[0][0].attemptId}`);
    expect(mocks.save.mock.calls[0][0]).toEqual({ ...submission, attemptId: expect.any(String) });
  });

  it("keeps the same attempt ID when retrying a failed save", async () => {
    const user = userEvent.setup();
    mocks.save.mockResolvedValueOnce({ ok: false, error: "Database unavailable" });
    mocks.save.mockImplementationOnce(async (input) => ({ ok: true, attemptId: input.attemptId }));
    render(<ResultSave submission={submission} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Database unavailable");
    await user.click(screen.getByRole("button", { name: "Retry saving" }));
    await screen.findByRole("link", { name: "View saved result" });
    expect(mocks.save.mock.calls[1][0].attemptId).toBe(mocks.save.mock.calls[0][0].attemptId);
  });

  it("surfaces network failure rather than reporting success", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.save.mockRejectedValueOnce(new Error("offline"));
    render(<ResultSave submission={submission} />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("save request failed"));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry saving" })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
