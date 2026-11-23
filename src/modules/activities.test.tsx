import { existsSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { subjects } from "./index";
import { getGradeCourses, getGradeUnits } from "./curriculum";
import { grade2ImmersionLessons } from "./french-immersion";
import { getLessonActivities } from "./activities";
import { expectedProblemAnswer, problemIsCorrect, problemSolution, wordAtPath, wordSearchPath } from "./problems";
import { correctQuizAnswers, quizEntries, validateInteractiveAnswer } from "./quiz-entries";
import { scoreSubmission, summarizeResult } from "@/lib/results";
import { ProblemControl } from "@/components/problems/problem-controls";
import { frenchVocabularyPractice } from "./activities/french";
import { vocabularyPractice } from "./activities/vocabulary";
import { spellingLists } from "./spelling";

const attemptId = "10000000-0000-4000-8000-000000000001";
const lessons = [
  ...subjects.flatMap((subject) => [
    ...getGradeCourses(subject.slug, 4).map((lesson) => ({ subject: subject.slug, lesson })),
    ...subject.lessons.filter((lesson) => lesson.questions.length).map((lesson) => ({ subject: subject.slug, lesson })),
  ]),
  ...grade2ImmersionLessons.map((lesson) => ({ subject: "french", lesson })),
];

describe("mixed activities for every published lesson", () => {
  it("covers all 82 published text lessons with three new activities each and all eight final formats", () => {
    expect(lessons).toHaveLength(82);
    const types = new Set(lessons.flatMap(({ subject, lesson }) => getLessonActivities(subject, lesson)?.final.map((problem) => problem.type) ?? []));
    expect(types.size).toBe(8);
    const totals = lessons.map(({ subject, lesson }) => getLessonActivities(subject, lesson));
    expect(totals.every((activities) => activities?.practice.length === 1 && activities.final.length === 2)).toBe(true);
    expect(totals.flatMap((activities) => [...activities!.practice, ...activities!.final])).toHaveLength(246);
  });

  it.each(lessons)("validates independent practice and final content in $subject / $lesson.slug", ({ subject, lesson }) => {
    const activities = getLessonActivities(subject, lesson)!;
    expect(activities).toBeDefined();
    const problems = [...activities.practice, ...activities.final];
    expect(new Set(problems.map((problem) => problem.id)).size).toBe(3);
    for (const problem of problems) {
      const correct = expectedProblemAnswer(problem);
      expect(problemIsCorrect(problem, correct), problem.id).toBe(true);
      expect(() => validateInteractiveAnswer(problem, correct)).not.toThrow();
      expect(problemSolution(problem)).not.toContain("undefined");
      expect(problem.explanation.length).toBeGreaterThan(20);
      expect(() => renderToStaticMarkup(<ProblemControl problem={problem} answer={[]} onChange={() => {}} disabled={false} language={lesson.program === "immersion" ? "fr" : "en"} />)).not.toThrow();
      if (problem.type === "diagram") {
        expect(existsSync(path.join(process.cwd(), "public", ...problem.image.split("/").filter(Boolean)))).toBe(true);
        expect(problem.targets.every((target) => target.x >= 0 && target.x <= 100 && target.y >= 0 && target.y <= 100)).toBe(true);
      }
      if (problem.type === "word-search") {
        expect(problem.grid.every((row) => row.length === problem.grid[0].length)).toBe(true);
        for (const word of problem.words) {
          let found = false;
          const size = problem.grid.length * problem.grid[0].length;
          for (let start = 0; start < size && !found; start++) {
            for (let end = 0; end < size && !found; end++) {
              if (wordAtPath(problem.grid, wordSearchPath(problem.grid, start, end)) === word.text) found = true;
            }
          }
          expect(found, `${problem.id}: ${word.text}`).toBe(true);
        }
      }
    }
    const practicePrompts = new Set([...activities.practice.map((problem) => problem.prompt), ...lesson.sections.flatMap((section) => section.questions?.map((question) => question.prompt) ?? [])]);
    expect(activities.final.every((problem) => !practicePrompts.has(problem.prompt))).toBe(true);
    const entries = quizEntries(lesson.questions, activities.final);
    expect(entries[1].kind).toBe("interactive");
    const submission = { kind: "quiz", attemptId, subject, lesson: lesson.slug, ...(lesson.grade ? { grade: lesson.grade } : {}), ...(lesson.program ? { program: lesson.program } : {}), quizVersion: 1, answers: correctQuizAnswers(entries) };
    const result = scoreSubmission(submission).result;
    expect(result.score).toBe(lesson.questions.length + 2);
    expect(result.total).toBe(entries.length);
    expect(summarizeResult(result)).not.toHaveProperty("sections");
    const old = scoreSubmission({ ...submission, quizVersion: undefined, answers: lesson.questions.map((question) => question.answerIndex) }).result;
    expect(old.score).toBe(lesson.questions.length);
    expect(old.total).toBe(lesson.questions.length);
  });

  it("adds practice to all four French lists and all vocabulary lessons without changing their tests", () => {
    const french = subjects.find((subject) => subject.slug === "french")!;
    expect(Object.keys(frenchVocabularyPractice).sort()).toEqual(french.lessons.map((lesson) => lesson.slug).sort());
    expect(Object.keys(vocabularyPractice).sort()).toEqual(spellingLists.map((list) => list.id).sort());
    for (const problem of [...Object.values(frenchVocabularyPractice), ...Object.values(vocabularyPractice)].flat()) {
      expect(() => validateInteractiveAnswer(problem, expectedProblemAnswer(problem))).not.toThrow();
      expect(() => renderToStaticMarkup(<ProblemControl problem={problem} answer={[]} onChange={() => {}} disabled={false} language="en" />)).not.toThrow();
    }
    expect(spellingLists.map((list) => list.words.length)).toEqual([15, 15, 17]);
    for (const list of spellingLists) {
      const matching = vocabularyPractice[list.id][0];
      expect(matching.type).toBe("pairs");
      if (matching.type !== "pairs") throw new Error("Vocabulary practice must match words to meanings.");
      expect(matching.left.map((entry) => entry.text)).toEqual(list.words);
      expect(matching.right).toHaveLength(list.words.length);
      expect(new Set(matching.matches).size).toBe(list.words.length);
      for (const [index, word] of list.words.entries()) {
        const definition = list.vocabulary.find((entry) => entry.id === word)!;
        expect(matching.right.find((entry) => entry.id === matching.matches[index])?.text).toBe(definition.options[definition.answerIndex]);
      }
      expect(problemIsCorrect(matching, expectedProblemAnswer(matching))).toBe(true);
      expect(problemIsCorrect(matching, expectedProblemAnswer(matching).slice(1))).toBe(false);
    }
  });

  it("preserves combined legacy unit quizzes and rejects forged mixed submissions", () => {
    const lesson = getGradeCourses("math", 4)[0];
    const activities = getLessonActivities("math", lesson)!;
    const answers = correctQuizAnswers(quizEntries(lesson.questions, activities.final));
    const base = { kind: "quiz", attemptId, subject: "math", grade: 4, lesson: lesson.slug, quizVersion: 1, answers };
    for (const overrides of [{ score: 100 }, { quizVersion: 2 }, { quizVersion: undefined }, { answers: answers.slice(1) }, { answers: answers.map(() => ["invented"]) }, { section: 0 }]) {
      expect(() => scoreSubmission({ ...base, ...overrides })).toThrow();
    }
    const incorrect = [...answers];
    incorrect[1] = ["999"];
    expect(scoreSubmission({ ...base, answers: incorrect }).result.score).toBe(answers.length - 1);
    const unit = getGradeUnits("math", 4)[0];
    expect(getLessonActivities("math", unit)).toBeUndefined();
    const oldAnswers = unit.questions.map((question) => question.answerIndex);
    expect(scoreSubmission({ ...base, lesson: unit.slug, quizVersion: undefined, answers: oldAnswers }).result.score).toBe(oldAnswers.length);
    expect(() => scoreSubmission({ ...base, lesson: unit.slug, answers: oldAnswers })).toThrow();
  });

  it("rejects malformed placements while allowing genuinely incorrect complete answers", () => {
    const lesson = getGradeCourses("math", 4).find((lesson) => lesson.slug === "number-builders-fractions")!;
    const problem = getLessonActivities("math", lesson)!.final[1];
    const correct = expectedProblemAnswer(problem);
    expect(() => validateInteractiveAnswer(problem, correct.map(() => correct[0]))).toThrow("repeated");
    expect(() => validateInteractiveAnswer(problem, ["unknown", ...correct.slice(1)])).toThrow("invalid");
    expect(() => validateInteractiveAnswer(problem, [])).toThrow("Complete");
    const wrong = [...correct].reverse();
    expect(() => validateInteractiveAnswer(problem, wrong)).not.toThrow();
    expect(problemIsCorrect(problem, wrong)).toBe(false);
  });

  it("accepts explicitly authored equivalent fractions and valid feeling synonyms", () => {
    const math = subjects.find((subject) => subject.slug === "math")!.lessons[0];
    expect(problemIsCorrect(getLessonActivities("math", math)!.final[0], ["2/3"])).toBe(true);
    const reading = subjects.find((subject) => subject.slug === "reading")!.lessons[0];
    expect(problemIsCorrect(getLessonActivities("reading", reading)!.final[0], ["happy"])).toBe(true);
  });
});
