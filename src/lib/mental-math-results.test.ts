import { describe, expect, it } from "vitest";
import { generateMentalMathGrid, mentalMathActivities, mentalMathAnswer, formatElapsedTime } from "@/modules/mental-math";
import { scoreSubmission, resultSchema } from "./results";

const attemptId = "10000000-0000-4000-8000-000000000001";

describe("Mental Mathematics grids and scoring", () => {
  it("never configures zero for single digits and places two-digit operands on the left in mixed multiplication", () => {
    expect(mentalMathActivities[0]).toMatchObject({ rowMin: 1, rowMax: 9, columnMin: 1, columnMax: 9 });
    expect(mentalMathActivities[2]).toMatchObject({ rowMin: 1, rowMax: 9, columnMin: 1, columnMax: 9 });
    expect(mentalMathActivities[3]).toMatchObject({ rowMin: 10, rowMax: 99, columnMin: 1, columnMax: 9 });
    const rows = [10, 20, 30, 40, 50, 60, 70, 99];
    const columns = [1, 2, 3, 4, 9];
    const submission = {
      kind: "mental-math", attemptId, activity: mentalMathActivities[3].slug,
      rows, columns, answers: columns.flatMap((column) => rows.map((row) => String(row * column))), elapsedMs: 5000,
    };
    expect(scoreSubmission(submission).result.score).toBe(40);
    expect(() => scoreSubmission({ ...submission, rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [10, 20, 30, 40, 50] })).toThrow("table numbers");
  });
  it.each(mentalMathActivities)("generates 8 by 5 random headers in the correct ranges for $title", (activity) => {
    const grids = new Set<string>();
    for (let index = 0; index < 25; index++) {
      const grid = generateMentalMathGrid(activity);
      expect(grid.rows).toHaveLength(8);
      expect(grid.columns).toHaveLength(5);
      expect(new Set(grid.rows).size).toBe(8);
      expect(new Set(grid.columns).size).toBe(5);
      expect(grid.rows.every((number) => number >= activity.rowMin && number <= activity.rowMax)).toBe(true);
      expect(grid.columns.every((number) => number >= activity.columnMin && number <= activity.columnMax)).toBe(true);
      grids.add(JSON.stringify(grid));
    }
    expect(grids.size).toBeGreaterThan(1);
  });

  it.each(mentalMathActivities)("scores exactly 40 answers column by column for $title and retains elapsed time in stored JSON", (activity) => {
    const rows = Array.from({ length: 8 }, (_, index) => activity.rowMax - index);
    const columns = Array.from({ length: 5 }, (_, index) => activity.columnMax - index);
    const answers = columns.flatMap((column) => rows.map((row) => String(mentalMathAnswer(activity, row, column))));
    const result = scoreSubmission({ kind: "mental-math", attemptId, activity: activity.slug, rows, columns, answers, elapsedMs: 123456 }).result;
    expect(result).toMatchObject({ kind: "mental-math", subject: "Math", score: 40, total: 40, elapsedMs: 123456 });
    expect(result.sections[0].items.map((item) => item.expected)).toEqual(answers);
    expect(resultSchema.parse(JSON.parse(JSON.stringify(result)))).toEqual(result);
  });

  it("counts blanks and wrong answers as incorrect and accepts time-limit submission", () => {
    const result = scoreSubmission({
      kind: "mental-math", attemptId, activity: "single-digit-addition",
      rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [1, 2, 3, 4, 5],
      answers: ["2", "003", "999", ...Array<string>(37).fill("")], elapsedMs: 300000,
    }).result;
    expect(result.score).toBe(2);
    expect(result.total).toBe(40);
    expect(result.sections[0].items[3].answer).toBe("");
    expect(result.elapsedMs).toBe(300000);
  });

  it("rejects altered dimensions, duplicates, invalid ranges and answers, forged scores, and invalid times", () => {
    const base = {
      kind: "mental-math", attemptId, activity: "single-digit-addition",
      rows: [1, 2, 3, 4, 5, 6, 7, 8], columns: [1, 2, 3, 4, 5],
      answers: Array<string>(40).fill(""), elapsedMs: 1000,
    };
    for (const overrides of [
      { activity: "missing" }, { activity: "__proto__" }, { rows: base.rows.slice(1) },
      { columns: [...base.columns, 6] }, { rows: [1, 1, 3, 4, 5, 6, 7, 8] },
      { columns: [1, 1, 3, 4, 5] }, { rows: [10, 2, 3, 4, 5, 6, 7, 8] },
      { rows: [0, 2, 3, 4, 5, 6, 7, 8] }, { columns: [0, 2, 3, 4, 5] },
      { activity: "two-digit-addition" }, { answers: base.answers.slice(1) },
      { answers: [...base.answers, ""] }, { answers: ["abc", ...base.answers.slice(1)] },
      { answers: ["-1", ...base.answers.slice(1)] }, { elapsedMs: -1 }, { elapsedMs: 300001 },
      { elapsedMs: 1.5 }, { score: 40 }, { userId: "another-user" },
    ]) expect(() => scoreSubmission({ ...base, ...overrides })).toThrow();
  });

  it("formats elapsed time without losing sub-second precision in storage", () => {
    expect(formatElapsedTime(0)).toBe("0:00");
    expect(formatElapsedTime(1)).toBe("0:01");
    expect(formatElapsedTime(60000)).toBe("1:00");
    expect(formatElapsedTime(123456)).toBe("2:04");
    expect(formatElapsedTime(300000)).toBe("5:00");
  });
});
