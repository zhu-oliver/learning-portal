import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as mentalMath from "@/modules/mental-math";
import { MentalMathQuiz } from "./mental-math-quiz";
import type { TestAnswers } from "@/lib/results";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("./result-save", () => ({ ResultSave: ({ submission }: { submission: TestAnswers }) => {
  mocks.save(submission);
  return <p>Result saving connected</p>;
} }));

let now = 0;
const grid = { rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [1, 2, 3, 4, 5] };

describe("Mental Mathematics quiz", () => {
  beforeEach(() => {
    now = 0;
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.spyOn(mentalMath, "generateMentalMathGrid").mockReturnValue(grid);
  });
  afterEach(() => { vi.useRealTimers(); });

  function start() {
    render(<MentalMathQuiz activity={mentalMath.mentalMathActivities[0]} />);
    fireEvent.click(screen.getByRole("button", { name: "Start five-minute quiz" }));
  }

  it("renders precisely 8 answer rows and 5 columns with accessible headers and focuses the first cell", () => {
    start();
    const table = screen.getByRole("table");
    expect(table.querySelectorAll("tbody tr")).toHaveLength(8);
    expect(table.querySelectorAll("thead th[scope=col]")).toHaveLength(6);
    expect(table.querySelectorAll("tbody th[scope=row]")).toHaveLength(8);
    expect(screen.getAllByRole("textbox")).toHaveLength(40);
    expect(screen.getByRole("textbox", { name: "Row 1, column 1: 1 + 1" })).toHaveFocus();
    expect(screen.getByRole("timer")).toHaveTextContent("5:00");
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("uses vertical Tab and Shift+Tab order across all 40 cells and exits to Submit", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    start();
    const inputs = screen.getAllByRole("textbox");
    for (let column = 1; column <= 5; column++) {
      for (let row = 1; row <= 8; row++) {
        expect(inputs[(row - 1) * 5 + column - 1]).toHaveFocus();
        await user.tab();
      }
    }
    expect(screen.getByRole("button", { name: "Submit answers" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("textbox", { name: /^Row 8, column 5:/ })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("textbox", { name: /^Row 7, column 5:/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("textbox", { name: /^Row 8, column 5:/ })).toHaveFocus();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("submits early, scores all 40 answers, saves elapsed time, and generates a fresh quiz on restart", () => {
    start();
    const inputs = screen.getAllByRole("textbox");
    for (let column = 0; column < 5; column++) {
      for (let row = 0; row < 8; row++) {
        fireEvent.change(inputs[row * 5 + column], { target: { value: String(grid.rows[row] + grid.columns[column]) } });
      }
    }
    now = 65432;
    fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
    expect(screen.getByText("40 / 40")).toBeInTheDocument();
    expect(screen.getByRole("table").querySelectorAll("td.correct")).toHaveLength(40);
    expect(screen.getByRole("table").querySelectorAll("td.incorrect")).toHaveLength(0);
    expect(screen.getByText("1:06")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quiz submitted" })).toHaveFocus();
    expect(mocks.save).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: "mental-math", activity: "single-digit-addition", ...grid, elapsedMs: 65432,
      answers: grid.columns.flatMap((column) => grid.rows.map((row) => String(row + column))),
    }));
    const calls = mocks.save.mock.calls.length;
    now = 400000;
    act(() => { vi.advanceTimersByTime(300000); });
    expect(mocks.save.mock.calls).toHaveLength(calls);
    vi.mocked(mentalMath.generateMentalMathGrid).mockReturnValue({ rows: [...grid.rows].reverse(), columns: [...grid.columns].reverse() });
    fireEvent.click(screen.getByRole("button", { name: "Start a new random quiz" }));
    expect(mentalMath.generateMentalMathGrid).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("timer")).toHaveTextContent("5:00");
    expect(screen.getByRole("textbox", { name: "Row 1, column 1: 8 + 5" })).toHaveValue("");
  });

  it("automatically submits at exactly five minutes, includes blanks, and freezes the original answers", () => {
    start();
    fireEvent.change(screen.getByRole("textbox", { name: /^Row 1, column 1:/ }), { target: { value: "2" } });
    now = 299999;
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.getAllByRole("textbox")).toHaveLength(40);
    expect(mocks.save).not.toHaveBeenCalled();
    now = 300000;
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.getByRole("heading", { name: "Time is up — quiz submitted" })).toBeInTheDocument();
    expect(screen.getByText("1 / 40")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
    expect(mocks.save).toHaveBeenLastCalledWith(expect.objectContaining({ elapsedMs: 300000, answers: ["2", ...Array<string>(39).fill("")] }));
    expect(screen.getByRole("table").querySelectorAll("td.correct")).toHaveLength(1);
    expect(screen.getByRole("table").querySelectorAll("td.incorrect")).toHaveLength(39);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("uses elapsed clock time after background throttling and rejects edits after the deadline", () => {
    start();
    now = 450000;
    fireEvent.change(screen.getByRole("textbox", { name: /^Row 1, column 1:/ }), { target: { value: "0" } });
    expect(screen.getByText("0 / 40")).toBeInTheDocument();
    expect(mocks.save).toHaveBeenLastCalledWith(expect.objectContaining({ elapsedMs: 300000, answers: Array<string>(40).fill("") }));
  });

  it("checks the deadline on returning to a tab and cleans up timer and listeners on leaving", () => {
    const { unmount } = render(<MentalMathQuiz activity={mentalMath.mentalMathActivities[0]} />);
    fireEvent.click(screen.getByRole("button", { name: "Start five-minute quiz" }));
    expect(vi.getTimerCount()).toBe(1);
    now = 350000;
    fireEvent(document, new Event("visibilitychange"));
    expect(screen.getByText("0 / 40")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports invalid numeric input, supports corrections, and does not reset the timer when typing", () => {
    start();
    const first = screen.getByRole("textbox", { name: /^Row 1, column 1:/ });
    fireEvent.change(first, { target: { value: "abc" } });
    expect(screen.getByRole("alert")).toHaveTextContent("Use whole numbers");
    expect(first).toHaveValue("");
    now = 60000;
    act(() => { vi.advanceTimersByTime(200); });
    fireEvent.change(first, { target: { value: "2" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("4:00");
    fireEvent.change(first, { target: { value: "" } });
    expect(screen.getByText("0 / 40 answered")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
    expect(mocks.save).toHaveBeenLastCalledWith(expect.objectContaining({ elapsedMs: 60000 }));
  });

  it("retains identical headers in review and marks correct, wrong, and blank cells without an answer list", () => {
    start();
    const headers = screen.getByRole("table").querySelector("thead")?.textContent;
    fireEvent.change(screen.getByRole("textbox", { name: /^Row 1, column 1:/ }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("textbox", { name: /^Row 2, column 1:/ }), { target: { value: "999" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit answers" }));
    const table = screen.getByRole("table");
    expect(table.querySelector("thead")?.textContent).toBe(headers);
    expect(table.querySelectorAll("tbody tr")).toHaveLength(8);
    expect(table.querySelectorAll("td.correct")).toHaveLength(1);
    expect(table.querySelectorAll("td.incorrect")).toHaveLength(39);
    expect(table.querySelectorAll("tbody tr")[0].querySelector("td")).toHaveTextContent("2Correct");
    expect(table.querySelectorAll("tbody tr")[1].querySelector("td")).toHaveTextContent("999IncorrectAnswer: 3");
    expect(screen.getAllByText("Blank")).toHaveLength(38);
    expect(screen.queryByText(/Your answer:/)).not.toBeInTheDocument();
  });
});
