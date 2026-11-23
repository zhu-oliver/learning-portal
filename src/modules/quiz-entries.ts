import type { Question } from "./types";
import type { Problem, ProblemAnswer } from "./problems";
import { expectedProblemAnswer, problemIsComplete, problemIsCorrect, problemSolution } from "./problems";

export type QuizAnswer = number | string[];
export type QuizEntry = { kind: "choice"; question: Question } | { kind: "interactive"; problem: Problem };

export function quizEntries(questions: readonly Question[], problems: readonly Problem[] = []): QuizEntry[] {
  const entries: QuizEntry[] = [];
  questions.forEach((question, index) => {
    entries.push({ kind: "choice", question });
    if (problems[index]) entries.push({ kind: "interactive", problem: problems[index] });
  });
  problems.slice(questions.length).forEach((problem) => entries.push({ kind: "interactive", problem }));
  return entries;
}

export function initialInteractiveAnswer(entry?: QuizEntry): string[] {
  return entry?.kind === "interactive" && entry.problem.type === "sequence" ? entry.problem.items.map((item) => item.id) : [];
}

export function validateInteractiveAnswer(problem: Problem, answer: ProblemAnswer) {
  if (!problemIsComplete(problem, answer)) throw new Error("Complete every part of the interactive question.");
  let allowed: readonly string[];
  switch (problem.type) {
    case "fill":
      if (answer[0].length > 120) throw new Error("The typed answer is too long.");
      return;
    case "sort": allowed = problem.categories.map((item) => item.id); break;
    case "pairs": allowed = problem.right.map((item) => item.id); break;
    case "sequence": allowed = problem.items.map((item) => item.id); break;
    case "diagram": allowed = problem.labels.map((item) => item.id); break;
    case "picture-match": allowed = problem.words.map((item) => item.id); break;
    case "word-search": allowed = problem.words.map((item) => item.id); break;
    case "spelling-highlight": allowed = problem.tokens.flatMap((token, index) => /^\p{L}/u.test(token) ? [String(index)] : []); break;
  }
  if (answer.some((value) => !allowed.includes(value)) || (problem.type !== "sort" && new Set(answer).size !== answer.length)) {
    throw new Error("An interactive answer contains an invalid or repeated item.");
  }
}

export function scoreQuizEntry(entry: QuizEntry, answer: QuizAnswer) {
  if (entry.kind === "choice") {
    if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= entry.question.options.length) throw new Error("A selected answer is not valid.");
    const question = entry.question;
    return { prompt: question.prompt, answer: question.options[answer], expected: question.options[question.answerIndex], correct: answer === question.answerIndex, explanation: question.explanation };
  }
  if (!Array.isArray(answer)) throw new Error("This question requires an interactive answer.");
  validateInteractiveAnswer(entry.problem, answer);
  return { prompt: entry.problem.prompt, answer: answer.join(", "), expected: problemSolution(entry.problem), correct: problemIsCorrect(entry.problem, answer), explanation: entry.problem.explanation };
}

export function correctQuizAnswers(entries: readonly QuizEntry[]): QuizAnswer[] {
  return entries.map((entry) => entry.kind === "choice" ? entry.question.answerIndex : expectedProblemAnswer(entry.problem));
}
