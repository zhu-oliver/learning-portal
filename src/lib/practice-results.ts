import { getSpellingList, parseCustomWords } from "@/modules/spelling";
import { getMentalMathActivity, mentalMathAnswer, MENTAL_MATH_ROWS, MENTAL_MATH_COLUMNS } from "@/modules/mental-math";
import type { Lesson } from "@/modules/types";
import type { TestAnswers, TestResult } from "./results";

type ResultItem = TestResult["sections"][number]["items"][number];

export function resultSection(title: string, items: ResultItem[]) {
  return { title, items, score: items.filter((item) => item.correct).length, total: items.length };
}

export function scoreMentalMath(submission: Extract<TestAnswers, { kind: "mental-math" }>): TestResult {
  const activity = getMentalMathActivity(submission.activity);
  if (!activity) throw new Error("Choose a valid Mental Mathematics activity.");
  if (new Set(submission.rows).size !== MENTAL_MATH_ROWS || new Set(submission.columns).size !== MENTAL_MATH_COLUMNS ||
      submission.rows.some((value) => value < activity.rowMin || value > activity.rowMax) ||
      submission.columns.some((value) => value < activity.columnMin || value > activity.columnMax)) {
    throw new Error("The Mental Mathematics table numbers are not valid for this activity.");
  }
  const symbol = activity.operation === "addition" ? "+" : "×";
  const items = submission.columns.flatMap((column, columnIndex) => submission.rows.map((row, rowIndex) => {
    const value = submission.answers[columnIndex * MENTAL_MATH_ROWS + rowIndex];
    const expected = mentalMathAnswer(activity, row, column);
    return { prompt: `${row} ${symbol} ${column}`, answer: value, expected: String(expected), correct: value !== "" && Number(value) === expected };
  }));
  const quiz = resultSection("Mental Mathematics", items);
  return {
    kind: "mental-math", title: activity.title, subject: "Math", score: quiz.score, total: quiz.total,
    elapsedMs: submission.elapsedMs, sections: [quiz],
  };
}

export function scoreFrenchMatching(lesson: Lesson | undefined, imageIds: readonly string[]): TestResult {
  const words = lesson?.frenchWords;
  if (!lesson || !words || !words.length || words.length > 50) throw new Error("Choose a valid French matching lesson.");
  if (imageIds.length !== words.length || new Set(imageIds).size !== words.length ||
      imageIds.some((id) => !words.some((word) => word.id === id))) {
    throw new Error(`Match each of the ${words.length} images exactly once.`);
  }
  const matches = resultSection("Word-to-image matching", words.map((word, index) => {
    const image = words.find((candidate) => candidate.id === imageIds[index]);
    if (!image) throw new Error("The selected image is not valid.");
    return { prompt: word.french, answer: image.english, expected: word.english, correct: word.id === image.id, explanation: `${word.french} means ${word.english}.` };
  }));
  return { kind: "matching", title: `${lesson.grade ? `Grade ${lesson.grade} — ` : ""}${lesson.title}`, subject: "French", score: matches.score, total: words.length, sections: [matches] };
}

export function scoreSpelling(submission: Extract<TestAnswers, { kind: "spelling" }>): TestResult {
  const list = getSpellingList(submission.listId);
  const custom = submission.listId === "custom";
  if (!list && !custom) throw new Error("Choose a valid spelling list.");
  if (custom && !submission.words) throw new Error("Custom words are missing.");
  if (!custom && submission.words) throw new Error("Predefined words cannot be replaced.");
  const words = list?.words ?? parseCustomWords(submission.words!.join("\n"));
  if (custom && words.length !== submission.words?.length) throw new Error("Custom words must be unique.");
  if (submission.answers.length !== words.length) throw new Error("Answer every spelling word before saving.");
  const vocabulary = list?.vocabulary ?? [];
  if (submission.vocabularyAnswers.length !== vocabulary.length) throw new Error("Answer every vocabulary question before saving.");
  const spelling = resultSection("Spelling", words.map((word, index) => ({
    prompt: word,
    answer: submission.answers[index].trim(),
    expected: word,
    correct: submission.answers[index].trim().toLowerCase() === word.toLowerCase(),
  })));
  const sections = [spelling];
  if (vocabulary.length) {
    sections.push(resultSection("Understanding", vocabulary.map((question, index) => {
      const picked = submission.vocabularyAnswers[index];
      if (picked >= question.options.length) throw new Error("A vocabulary answer is not valid.");
      return { prompt: question.prompt, answer: question.options[picked], expected: question.options[question.answerIndex], correct: picked === question.answerIndex, explanation: question.explanation };
    })));
  }
  return {
    kind: "spelling", title: list?.title ?? "Custom word list", subject: "Spelling Bee",
    score: sections.reduce((sum, item) => sum + item.score, 0),
    total: sections.reduce((sum, item) => sum + item.total, 0), sections,
  };
}
