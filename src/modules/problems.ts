export interface ProblemItem {
  id: string;
  text: string;
}

interface ProblemBase {
  id: string;
  prompt: string;
  explanation: string;
}

export type Problem =
  | (ProblemBase & { type: "word-search"; grid: readonly string[]; words: readonly ProblemItem[] })
  | (ProblemBase & { type: "picture-match"; words: readonly ProblemItem[]; pictures: readonly { id: string; pictureId: string; description: string; wordId: string }[] })
  | (ProblemBase & { type: "sort"; items: readonly (ProblemItem & { categoryId: string })[]; categories: readonly ProblemItem[] })
  | (ProblemBase & { type: "sequence"; items: readonly ProblemItem[]; order: readonly string[] })
  | (ProblemBase & { type: "pairs"; left: readonly ProblemItem[]; right: readonly ProblemItem[]; matches: readonly string[] })
  | (ProblemBase & { type: "diagram"; image: string; description: string; labels: readonly ProblemItem[]; targets: readonly { id: string; x: number; y: number; labelId: string }[] })
  | (ProblemBase & { type: "fill"; before: string; after: string; accepted: readonly string[]; caseSensitive?: boolean })
  | (ProblemBase & { type: "spelling-highlight"; tokens: readonly string[]; incorrect: readonly number[] });

export type ProblemAnswer = readonly string[];

function normalize(text: string, caseSensitive = false) {
  const trimmed = text.normalize("NFC").trim().replace(/\s+/g, " ");
  return caseSensitive ? trimmed : trimmed.toLocaleLowerCase();
}

export function expectedProblemAnswer(problem: Problem): string[] {
  switch (problem.type) {
    case "word-search": return problem.words.map((word) => word.id);
    case "picture-match": return problem.pictures.map((picture) => picture.wordId);
    case "sort": return problem.items.map((item) => item.categoryId);
    case "sequence": return [...problem.order];
    case "pairs": return [...problem.matches];
    case "diagram": return problem.targets.map((target) => target.labelId);
    case "fill": return [problem.accepted[0]];
    case "spelling-highlight": return problem.incorrect.map(String);
  }
}

export function problemIsComplete(problem: Problem, answer: ProblemAnswer): boolean {
  switch (problem.type) {
    case "fill": return answer.length === 1 && answer[0].trim().length > 0;
    case "word-search": return answer.length === problem.words.length && new Set(answer).size === answer.length && answer.every((id) => problem.words.some((word) => word.id === id));
    // Children can check a partially highlighted sentence and learn which words they missed.
    case "spelling-highlight": return answer.length > 0;
    default: return answer.length === expectedProblemAnswer(problem).length && answer.every(Boolean);
  }
}

export function problemIsCorrect(problem: Problem, answer: ProblemAnswer): boolean {
  if (!problemIsComplete(problem, answer)) return false;
  if (problem.type === "fill") return problem.accepted.some((text) => normalize(text, problem.caseSensitive) === normalize(answer[0], problem.caseSensitive));
  const expected = expectedProblemAnswer(problem);
  if (problem.type === "word-search" || problem.type === "spelling-highlight") {
    return answer.length === expected.length && new Set(answer).size === answer.length && answer.every((value) => expected.includes(value));
  }
  return answer.length === expected.length && answer.every((value, index) => value === expected[index]);
}

export function wordSearchPath(grid: readonly string[], start: number, end: number): number[] {
  const width = grid[0]?.length ?? 0;
  if (!width || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0 || start >= width * grid.length || end >= width * grid.length) return [];
  const startRow = Math.floor(start / width), startColumn = start % width;
  const rowDelta = Math.floor(end / width) - startRow, columnDelta = end % width - startColumn;
  if (rowDelta !== 0 && columnDelta !== 0 && Math.abs(rowDelta) !== Math.abs(columnDelta)) return [];
  return Array.from({ length: Math.max(Math.abs(rowDelta), Math.abs(columnDelta)) + 1 }, (_, index) =>
    (startRow + index * Math.sign(rowDelta)) * width + startColumn + index * Math.sign(columnDelta));
}

export function wordAtPath(grid: readonly string[], path: readonly number[]) {
  const width = grid[0].length;
  return path.map((index) => grid[Math.floor(index / width)][index % width]).join("");
}

export function problemSolution(problem: Problem): string {
  switch (problem.type) {
    case "fill": return problem.accepted[0];
    case "word-search": return problem.words.map((word) => word.text).join(", ");
    case "picture-match": return problem.pictures.map((picture, index) => `${index + 1}: ${problem.words.find((word) => word.id === picture.wordId)?.text}`).join("; ");
    case "sort": return problem.items.map((item) => `${item.text}: ${problem.categories.find((category) => category.id === item.categoryId)?.text}`).join("; ");
    case "sequence": return problem.order.map((id) => problem.items.find((item) => item.id === id)?.text).join(" → ");
    case "pairs": return problem.left.map((item, index) => `${item.text}: ${problem.right.find((right) => right.id === problem.matches[index])?.text}`).join("; ");
    case "diagram": return problem.targets.map((target, index) => `${index + 1}: ${problem.labels.find((label) => label.id === target.labelId)?.text}`).join("; ");
    case "spelling-highlight": return problem.incorrect.map((index) => problem.tokens[index]).join(", ");
  }
}
