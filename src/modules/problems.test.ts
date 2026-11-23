import { describe, expect, it } from "vitest";
import { expectedProblemAnswer, problemIsComplete, problemIsCorrect, problemSolution, wordAtPath, wordSearchPath } from "./problems";
import { immersionProblems, problemExamples } from "./problem-examples";
import { getGradeCourse } from "./curriculum";
import { getLessonActivities } from "./activities";

describe("reusable problem definitions and scoring", () => {
  it("covers eight distinct problem types with unique IDs", () => {
    expect(new Set(problemExamples.map((problem) => problem.type)).size).toBe(8);
    expect(new Set([...problemExamples, ...immersionProblems].map((problem) => problem.id)).size).toBe(10);
  });

  it.each([...problemExamples, ...immersionProblems])("scores the full answer and rejects missing or wrong answers for $id", (problem) => {
    const correct = expectedProblemAnswer(problem);
    expect(problemIsComplete(problem, correct)).toBe(true);
    expect(problemIsCorrect(problem, correct)).toBe(true);
    expect(problemIsCorrect(problem, [])).toBe(false);
    expect(problemIsCorrect(problem, [...correct, "extra"])).toBe(false);
    expect(problemIsCorrect(problem, correct.map(() => "wrong"))).toBe(false);
    expect(problemSolution(problem)).not.toContain("undefined");
    expect(problemSolution(problem).length).toBeGreaterThan(0);
    expect(problem.explanation.length).toBeGreaterThan(20);
    if (problem.type === "word-search" || problem.type === "spelling-highlight") {
      expect(problemIsCorrect(problem, [...correct].reverse())).toBe(true);
      expect(problemIsCorrect(problem, correct.map(() => correct[0]))).toBe(false);
    }
  });

  it("compares fill answers using whitespace, Unicode normalization and case, without silently ignoring accents", () => {
    const problem = immersionProblems[1];
    expect(problemIsCorrect(problem, [" RÉPÉTER "])).toBe(true);
    expect(problemIsCorrect(problem, ["re\u0301pe\u0301ter"])).toBe(true);
    expect(problemIsCorrect(problem, ["repeter"])).toBe(false);
    expect(problemIsComplete(problem, ["   "])).toBe(false);
    expect(problemIsCorrect({ ...problem, type: "fill", before: "", after: "", accepted: ["Abc"], caseSensitive: true }, ["abc"])).toBe(false);
  });

  it("finds every word in the authored grid, including vertical and diagonal paths", () => {
    const search = problemExamples[0];
    if (search.type !== "word-search") throw new Error("Expected word search.");
    expect(search.grid.every((row) => row.length === search.grid[0].length)).toBe(true);
    for (const word of search.words) {
      const matches = search.grid.flatMap((row, rowIndex) => [...row].flatMap((_, columnIndex) =>
        search.grid.flatMap((endRow, endRowIndex) => [...endRow].flatMap((_, endColumnIndex) => {
          const path = wordSearchPath(search.grid, rowIndex * row.length + columnIndex, endRowIndex * row.length + endColumnIndex);
          return wordAtPath(search.grid, path) === word.text ? [path] : [];
        }))));
      expect(matches.length, word.text).toBeGreaterThan(0);
    }
    expect(wordAtPath(search.grid, wordSearchPath(search.grid, 0, 2))).toBe("CAT");
    expect(wordAtPath(search.grid, wordSearchPath(search.grid, 5, 15))).toBe("DOG");
    expect(wordAtPath(search.grid, wordSearchPath(search.grid, 12, 24))).toBe("PIG");
    expect(wordSearchPath(search.grid, 0, 7)).toEqual([]);
    expect(wordSearchPath(search.grid, -1, 7)).toEqual([]);
    expect(wordSearchPath(search.grid, 0, 25)).toEqual([]);
  });

  it("uses actual lesson IDs and separates practice from final activities", () => {
    const science = getGradeCourse("science", 4, "habitat-investigators-food-webs");
    expect(science).toBeDefined();
    expect(getLessonActivities("science", science!)?.practice[0].type).toBe("sort");
    expect(getLessonActivities("science", science!)?.final.map((problem) => problem.type)).toEqual(["fill", "diagram"]);
    expect(science!.questions.every((question) => question.options.length > 0)).toBe(true);
  });
});
