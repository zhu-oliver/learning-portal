import { z } from "zod";
import { getLesson, getSubject } from "@/modules";
import { getGradeCourse } from "@/modules/curriculum";
import { MENTAL_MATH_ROWS, MENTAL_MATH_COLUMNS, MENTAL_MATH_LIMIT_MS } from "@/modules/mental-math";
import { quizEntries, scoreQuizEntry } from "@/modules/quiz-entries";
import { getLessonActivities } from "@/modules/activities";
import { resultSection, scoreFrenchMatching, scoreMentalMath, scoreSpelling } from "./practice-results";

const answer = z.number().int().min(0).max(20);
const typed = z.string().max(80);
const attemptId = z.uuid();

export const submissionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mental-math"), attemptId,
    activity: z.string().max(80),
    rows: z.array(z.number().int().min(0).max(99)).length(MENTAL_MATH_ROWS),
    columns: z.array(z.number().int().min(0).max(99)).length(MENTAL_MATH_COLUMNS),
    answers: z.array(z.string().regex(/^\d{0,3}$/)).length(MENTAL_MATH_ROWS * MENTAL_MATH_COLUMNS),
    elapsedMs: z.number().int().min(0).max(MENTAL_MATH_LIMIT_MS),
  }).strict(),
  z.object({
    kind: z.literal("matching"), attemptId,
    lesson: z.string().max(80),
    grade: z.number().int().min(1).max(8).optional(),
    imageIds: z.array(z.string().max(40)).min(1).max(50),
  }).strict(),
  z.object({
    kind: z.literal("quiz"), attemptId,
    subject: z.string().max(60), lesson: z.string().max(80),
    program: z.enum(["core", "immersion"]).optional(),
    grade: z.number().int().min(1).max(8).optional(),
    section: z.number().int().min(0).max(50).optional(),
    quizVersion: z.literal(1).optional(),
    answers: z.array(z.union([answer, z.array(z.string().max(120)).max(80)])).min(1).max(100),
  }).strict(),
  z.object({
    kind: z.literal("spelling"), attemptId,
    listId: z.string().max(60),
    words: z.array(z.string().max(40)).min(1).max(50).optional(),
    answers: z.array(typed).min(1).max(50),
    vocabularyAnswers: z.array(answer).max(50),
  }).strict(),
]);

export type TestSubmission = z.infer<typeof submissionSchema>;
type WithoutAttempt<T> = T extends unknown ? Omit<T, "attemptId"> : never;
export type TestAnswers = WithoutAttempt<TestSubmission>;

export const resultSchema = z.object({
  kind: z.enum(["quiz", "spelling", "matching", "mental-math"]),
  title: z.string(),
  subject: z.string(),
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  elapsedMs: z.number().int().min(0).max(MENTAL_MATH_LIMIT_MS).optional(),
  sections: z.array(z.object({
    title: z.string(),
    score: z.number().int().nonnegative(),
    total: z.number().int().positive(),
    items: z.array(z.object({
      prompt: z.string(),
      answer: z.string(),
      expected: z.string(),
      correct: z.boolean(),
      explanation: z.string().optional(),
    })),
  })),
});

export type TestResult = z.infer<typeof resultSchema>;
export const resultSummarySchema = resultSchema.omit({ sections: true });
export const storedResultSchema = resultSummarySchema.extend({ sections: resultSchema.shape.sections.optional() });
export type StoredTestResult = z.infer<typeof storedResultSchema>;

export function summarizeResult(result: StoredTestResult) {
  return resultSummarySchema.parse(result);
}

export function scoreSubmission(input: unknown): { attemptId: string; result: TestResult } {
  const submission = submissionSchema.parse(input);
  if (submission.kind === "mental-math") {
    return { attemptId: submission.attemptId, result: scoreMentalMath(submission) };
  }
  if (submission.kind === "matching") {
    const lesson = submission.grade ? getGradeCourse("french", submission.grade, submission.lesson) : getLesson("french", submission.lesson);
    return { attemptId: submission.attemptId, result: scoreFrenchMatching(lesson, submission.imageIds) };
  }
  if (submission.kind === "quiz") {
    if (submission.program && submission.subject !== "french") throw new Error("A French program can only be used with French quizzes.");
    if (submission.program === "immersion" && !submission.grade) throw new Error("Choose a grade for French Immersion.");
    if (submission.section !== undefined) throw new Error("Section questions are practice only and cannot be saved. Complete the end-of-lesson quiz instead.");
    const subject = getSubject(submission.subject);
    const lesson = submission.grade ? getGradeCourse(submission.subject, submission.grade, submission.lesson, submission.program) : getLesson(submission.subject, submission.lesson);
    const questions = lesson?.questions;
    const problems = submission.quizVersion === 1 && lesson ? getLessonActivities(submission.subject, lesson)?.final ?? [] : [];
    const entries = quizEntries(questions ?? [], problems);
    if (!subject || !lesson || !questions?.length || submission.answers.length !== entries.length ||
        (submission.quizVersion === 1 && !problems.length)) {
      throw new Error("This lesson or answer count is not valid.");
    }
    const items = entries.map((entry, index) => scoreQuizEntry(entry, submission.answers[index]));
    const sectionTitle = lesson.grade ? "End-of-lesson quiz" : "Practice quiz";
    const quiz = resultSection(sectionTitle, items);
    return { attemptId: submission.attemptId, result: { kind: "quiz", title: `${lesson.grade ? `Grade ${lesson.grade} — ` : ""}${lesson.title}`, subject: submission.program === "immersion" ? "French Immersion" : subject.title, score: quiz.score, total: quiz.total, sections: [quiz] } };
  }

  return { attemptId: submission.attemptId, result: scoreSpelling(submission) };
}
