import { existsSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getGradeCourse, getGradeCourses, getGradeCoverage, grades } from "./curriculum";
import { getAdditionalGradeContent } from "./curriculum-data";
import { getLessonActivities } from "./activities";
import { isImmersionLesson } from "./french-immersion";
import { expectedProblemAnswer, problemIsCorrect, wordAtPath, wordSearchPath } from "./problems";
import { correctQuizAnswers, quizEntries, validateInteractiveAnswer } from "./quiz-entries";
import { scoreSubmission, summarizeResult } from "@/lib/results";
import { ProblemControl } from "@/components/problems/problem-controls";

const attemptId = "10000000-0000-4000-8000-000000000001";
const programs = [
  ...["math", "reading", "science"].flatMap((subject) => grades.filter((grade) => grade !== 4).map((grade) =>
    ({ subject, grade, program: "core" as const }))),
  ...grades.filter((grade) => grade > 4).map((grade) => ({ subject: "french", grade, program: "core" as const })),
  ...grades.filter((grade) => grade !== 2).map((grade) => ({ subject: "french", grade, program: "immersion" as const })),
];

describe("all Ontario grade releases", () => {
  it("publishes every requested grade/program and no unsupported Core French grades", () => {
    expect(programs).toHaveLength(32);
    for (const subject of ["math", "reading", "science"]) {
      for (const grade of grades) expect(getGradeCourses(subject, grade).length, `${subject}/${grade}`).toBeGreaterThan(0);
    }
    for (const grade of grades) {
      expect(getGradeCourses("french", grade).length > 0).toBe(grade >= 4);
      expect(getGradeCourses("french", grade, "immersion").length).toBeGreaterThan(0);
      expect(getGradeCourses("science", grade, "immersion")).toEqual([]);
    }
    for (const invalid of ["unknown", "__proto__", "constructor"]) {
      expect(getAdditionalGradeContent(invalid, 1)).toBeUndefined();
      expect(getGradeCourses(invalid, 8)).toEqual([]);
      expect(getGradeCoverage(invalid, 1)).toBeUndefined();
    }
  });

  it("matches the documented release counts for every grade and program", () => {
    const expected = [
      [19, 22, 12, 0, 10], [18, 22, 12, 0, 10], [19, 22, 12, 0, 10], [23, 19, 15, 12, 10],
      [20, 21, 12, 10, 10], [20, 21, 13, 10, 10], [20, 21, 13, 10, 10], [22, 21, 15, 10, 10],
    ];
    const actual = grades.map((grade) => [
      ...["math", "reading", "science", "french"].map((subject) => getGradeCourses(subject, grade).length),
      getGradeCourses("french", grade, "immersion").length,
    ]);
    expect(actual).toEqual(expected);
    expect(actual.flat().reduce((total, count) => total + count, 0)).toBe(566);
    expect(programs.reduce((total, { subject, grade, program }) => total + getGradeCourses(subject, grade, program).length, 0)).toBe(487);
    const specifics = grades.reduce((total, grade) => total +
      ["math", "reading", "science", "french"].reduce((sum, subject) => sum + (getGradeCoverage(subject, grade)?.specificCount ?? 0), 0) +
      (grade === 2 ? 39 : getGradeCoverage("french", grade, "immersion")!.specificCount), 0);
    expect(specifics).toBe(1689);
  });

  it.each(programs)("maps independently researched focuses for $subject grade $grade $program", ({ subject, grade, program }) => {
    const content = getAdditionalGradeContent(subject, grade, program)!;
    const lessons = getGradeCourses(subject, grade, program);
    const coverage = getGradeCoverage(subject, grade, program)!;
    expect(content).toBeDefined();
    expect(lessons).toBe(content.lessons);
    expect(lessons.length).toBeGreaterThanOrEqual(subject === "french" ? 10 : 12);
    expect(content.source).toMatch(/^https:\/\/(?:(?:www\.)?dcp\.edu\.gov\.on\.ca|www\.edu\.gov\.on\.ca|www\.ontario\.ca|assets-us-01\.kc-usercontent\.com)\//);
    expect(content.edition).toBe(subject === "math" ? 2020 : subject === "reading" ? 2023 : subject === "science" ? 2022 : 2013);
    const ids = [...content.expectations, ...(content.processes ?? [])].map(([id]) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(coverage.specificCount).toBe(content.expectations.length);
    expect(coverage.expectations.length).toBeGreaterThan(20);
    expect(coverage.expectations.every((expectation) => expectation.references.length > 0)).toBe(true);
    const allowed = new Set(ids);
    for (const lesson of lessons) {
      expect(lesson.expectations?.every((id) => allowed.has(id)), lesson.slug).toBe(true);
      expect(lesson.sections.every((section) => section.expectations?.length && section.expectations.every((id) => allowed.has(id))), lesson.slug).toBe(true);
    }
    expect(Object.keys(content.activities).sort()).toEqual(lessons.map((lesson) => lesson.slug).sort());
  });

  it.each(programs)("provides deep teaching, independent mixed quizzes and authoritative scoring in $subject grade $grade $program", ({ subject, grade, program }) => {
    const lessons = getGradeCourses(subject, grade, program);
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(lessons.length);
    for (const lesson of lessons) {
      expect(getGradeCourse(subject, grade, lesson.slug, program)).toBe(lesson);
      expect(lesson.grade, lesson.slug).toBe(grade);
      expect(lesson.slug).toMatch(/^[a-z0-9-]{1,80}$/);
      expect(lesson.source).toBeTruthy();
      expect(lesson.unitSlug).toBeTruthy();
      expect(lesson.unitTitle).toBeTruthy();
      expect(lesson.sections, lesson.slug).toHaveLength(3);
      expect(lesson.sections.reduce((total, section) => total + section.body.length, 0), lesson.slug).toBeGreaterThan(1500);
      expect(new Set(lesson.sections.map((section) => section.heading)).size).toBe(3);
      const practice = lesson.sections.flatMap((section) => section.questions ?? []);
      for (const section of lesson.sections) {
        expect(section.body.length, `${lesson.slug}/${section.heading}`).toBeGreaterThan(250);
        expect(section.activity?.length, lesson.slug).toBeGreaterThan(100);
        expect(section.questions?.length, lesson.slug).toBeGreaterThanOrEqual(1);
      }
      expect(lesson.questions, lesson.slug).toHaveLength(4);
      expect(lesson.questions.map((question) => question.sectionIndex).sort()).toEqual([0, 0, 1, 2]);
      expect(new Set([...practice, ...lesson.questions].map((question) => question.id)).size).toBe(practice.length + 4);
      for (const question of [...practice, ...lesson.questions]) {
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(question.options).size).toBe(question.options.length);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
        expect(question.explanation.length).toBeGreaterThan(20);
      }
      expect(lesson.questions.every((question) => !practice.some((entry) => entry.prompt === question.prompt)), lesson.slug).toBe(true);
      if (program === "immersion") {
        expect(isImmersionLesson(lesson), lesson.slug).toBe(true);
        if (isImmersionLesson(lesson)) {
          for (const section of lesson.sections) expect(section.englishHelp.length).toBeGreaterThan(100);
        }
      }
      const activities = getLessonActivities(subject, lesson)!;
      expect(activities?.practice).toHaveLength(1);
      expect(activities?.final).toHaveLength(2);
      expect(new Set([...activities.practice, ...activities.final].map((problem) => problem.id)).size).toBe(3);
      const entries = quizEntries(lesson.questions, activities.final);
      const submission = { kind: "quiz", attemptId, subject, grade, ...(subject === "french" ? { program } : {}), lesson: lesson.slug, quizVersion: 1, answers: correctQuizAnswers(entries) };
      const result = scoreSubmission(submission).result;
      expect(result.score, lesson.slug).toBe(6);
      expect(result.total).toBe(6);
      expect(result.title).toContain(`Grade ${grade}`);
      expect(summarizeResult(result)).not.toHaveProperty("sections");
      expect(scoreSubmission({ ...submission, quizVersion: undefined, answers: lesson.questions.map((question) => question.answerIndex) }).result.score).toBe(4);
      expect(() => scoreSubmission({ ...submission, grade: grade === 8 ? 1 : grade + 1 })).toThrow();
      expect(() => scoreSubmission({ ...submission, answers: submission.answers.slice(1) })).toThrow();
      expect(() => scoreSubmission({ ...submission, section: 0 })).toThrow();
    }
  });

  it.each(programs)("validates real interactive assets, answer shapes and word-search paths in $subject grade $grade $program", ({ subject, grade, program }) => {
    for (const lesson of getGradeCourses(subject, grade, program)) {
      const activities = getLessonActivities(subject, lesson)!;
      for (const problem of [...activities.practice, ...activities.final]) {
        const answer = expectedProblemAnswer(problem);
        expect(problemIsCorrect(problem, answer), `${lesson.slug}/${problem.id}`).toBe(true);
        expect(() => validateInteractiveAnswer(problem, answer)).not.toThrow();
        expect(problem.explanation.length).toBeGreaterThan(20);
        expect(() => renderToStaticMarkup(<ProblemControl problem={problem} answer={[]} onChange={() => {}} disabled={false} language={program === "immersion" ? "fr" : "en"} />)).not.toThrow();
        if (problem.type === "diagram") {
          expect(problem.image).toMatch(/^\/images\//);
          expect(existsSync(path.join(process.cwd(), "public", ...problem.image.split("/").filter(Boolean))), problem.image).toBe(true);
          expect(problem.targets.every((target) => target.x >= 0 && target.x <= 100 && target.y >= 0 && target.y <= 100)).toBe(true);
        }
        if (problem.type === "word-search") {
          expect(problem.grid.every((row) => row.length === problem.grid[0].length)).toBe(true);
          const size = problem.grid.length * problem.grid[0].length;
          for (const word of problem.words) {
            let found = false;
            for (let start = 0; start < size && !found; start++) {
              for (let end = 0; end < size && !found; end++) {
                if (wordAtPath(problem.grid, wordSearchPath(problem.grid, start, end)) === word.text) found = true;
              }
            }
            expect(found, `${lesson.slug}/${word.text}`).toBe(true);
          }
        }
      }
    }
  });
});
