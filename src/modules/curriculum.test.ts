import { describe, expect, it } from "vitest";
import { getGradeCourse, getGradeCourses, getGradeUnits, getGradeCoverage, grades, parseGrade } from "./curriculum";
import { specificExpectations, overarchingProcesses, type CurriculumSubject } from "./grade4/expectations";
import { scoreSubmission, resultSchema } from "@/lib/results";
import { spellingLists } from "./spelling";
import { getAssessmentQuestions } from "./grade4/assessments";

const attemptId = "10000000-0000-4000-8000-000000000001";
const subjects: readonly CurriculumSubject[] = ["math", "reading", "science", "french"];

// Independently enumerated counts per overall expectation in the official Grade 4 lists.
const ranges: Readonly<Record<CurriculumSubject, Readonly<Record<string, number>>>> = {
  math: { B1: 9, B2: 8, C1: 4, C2: 3, C3: 2, D1: 6, D2: 2, E1: 3, E2: 6, F1: 5 },
  reading: { A1: 2, A2: 7, A3: 3, B1: 5, B2: 3, B3: 3, C1: 7, C2: 7, C3: 8, D1: 5, D2: 6, D3: 3 },
  science: { A1: 5, A2: 2, A3: 3, B1: 2, B2: 7, C1: 2, C2: 8, D1: 2, D2: 5, E1: 2, E2: 6 },
  french: { A1: 2, A2: 3, A3: 2, B1: 3, B2: 3, B3: 2, C1: 4, C2: 3, C3: 2, D1: 2, D2: 4, D3: 2 },
};

describe("Ontario Grade 4 curriculum", () => {
  it.each(subjects)("maps every verified %s specific expectation to an authored section", (subject) => {
    const expected = Object.entries(ranges[subject]).flatMap(([prefix, count]) =>
      Array.from({ length: count }, (_, index) => `${prefix}.${index + 1}`),
    );
    expect(specificExpectations[subject].map(([id]) => id).sort()).toEqual(expected.sort());
    const allowed = new Set([...expected, ...(overarchingProcesses[subject] ?? []).map(([id]) => id)]);
    const coverage = getGradeCoverage(subject, 4)!;
    expect(coverage.specificCount).toBe(expected.length);
    expect(coverage.expectations.every((entry) => entry.references.length > 0)).toBe(true);
    for (const lesson of getGradeCourses(subject, 4)) {
      expect(lesson.expectations?.every((id) => allowed.has(id))).toBe(true);
    }
  });

  it("publishes all supported grades without inventing early Core French requirements", () => {
    expect(grades).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const subject of [...subjects, "spelling"]) {
      for (const grade of grades) {
        expect(parseGrade(`grade-${grade}`)).toBe(grade);
        const published = subject === "spelling" ? grade === 4 : subject !== "french" || grade >= 4;
        expect(getGradeCourses(subject, grade).length > 0).toBe(published);
        expect(Boolean(getGradeCoverage(subject, grade))).toBe(published);
      }
    }
    for (const invalid of ["grade-0", "grade-9", "grade-04", "4", "practice"]) expect(parseGrade(invalid)).toBeUndefined();
    for (const invalid of ["unknown", "__proto__", "constructor"]) {
      expect(getGradeCourses(invalid, 4)).toEqual([]);
      expect(getGradeCourse(invalid, 4, "anything")).toBeUndefined();
      expect(getGradeCoverage(invalid, 4)).toBeUndefined();
    }
    expect(getGradeCoverage("spelling", 4)?.specificCount).toBe(3);
    expect(spellingLists.map((list) => list.id)).toEqual(["test-1", "test-2", "test-3"]);
  });

  it.each(subjects.flatMap((subject) => getGradeCourses(subject, 4).map((lesson) => [lesson.slug, lesson] as const)))(
    "provides substantial original instruction, guided activities, and independent assessment for %s", (_, lesson) => {
        expect(lesson.grade).toBe(4);
        expect(lesson.slug).toMatch(/^[a-z0-9-]+$/);
        expect(lesson.source).toMatch(/^https:\/\/dcp\.edu\.gov\.on\.ca\//);
        expect(lesson.questions).toHaveLength(4);
        expect(new Set(lesson.questions.map((question) => question.id)).size).toBe(lesson.questions.length);
        expect(lesson.questions.length).toBeLessThanOrEqual(100);
        const practicePrompts = new Set(lesson.sections.flatMap((section) => section.questions!.map((question) => question.prompt.trim().toLowerCase())));
        expect(lesson.questions.every((question) => !practicePrompts.has(question.prompt.trim().toLowerCase()))).toBe(true);
        for (const [index] of lesson.sections.entries()) {
          expect(lesson.questions.filter((question) => question.sectionIndex === index)).toHaveLength(index === 0 ? 2 : 1);
        }
        for (const question of lesson.questions) {
          expect(new Set(question.options).size).toBe(question.options.length);
          expect(question.answerIndex).toBeGreaterThanOrEqual(0);
          expect(question.answerIndex).toBeLessThan(question.options.length);
          expect(question.explanation.length).toBeGreaterThan(20);
        }
        expect(lesson.sections).toHaveLength(3);
        expect(lesson.sections.reduce((length, section) => length + section.body.length, 0)).toBeGreaterThan(1500);
        expect(new Set(lesson.sections.map((section) => section.heading)).size).toBe(lesson.sections.length);
        for (const section of lesson.sections) {
          expect(section.body.length).toBeGreaterThan(250);
          expect(section.activity!.length).toBeGreaterThan(100);
          expect(section.questions!.length).toBeGreaterThanOrEqual(1);
          expect(new Set(section.questions!.map((question) => question.id)).size).toBe(section.questions!.length);
          for (const question of section.questions!) {
            expect(new Set(question.options).size).toBe(question.options.length);
            expect(question.answerIndex).toBeGreaterThanOrEqual(0);
            expect(question.answerIndex).toBeLessThan(question.options.length);
            expect(question.explanation.length).toBeGreaterThan(10);
          }
        }
  });

  it("publishes exactly one expanded lesson per former topic and preserves old quiz banks", () => {
    const counts = { math: 23, reading: 19, science: 15, french: 12, spelling: 3 };
    for (const [subject, count] of Object.entries(counts)) {
      const lessons = getGradeCourses(subject, 4);
      expect(lessons).toHaveLength(count);
      expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(lessons.length);
      for (const unit of getGradeUnits(subject, 4)) {
        const topics = lessons.filter((lesson) => lesson.unitSlug === unit.slug);
        expect(topics.map((topic) => topic.title)).toEqual(unit.sections.map((section) => section.heading));
        expect(topics.every((topic) => topic.unitTitle === unit.title)).toBe(true);
        expect(getGradeCourse(subject, 4, unit.slug)).toBe(unit);
        expect(unit.questions).toEqual(getAssessmentQuestions(unit.slug, unit.sections.length));
        const saved = scoreSubmission({
          kind: "quiz", attemptId, subject, grade: 4, lesson: unit.slug,
          answers: unit.questions.map((question) => question.answerIndex),
        }).result;
        expect(saved.score).toBe(unit.questions.length);
        expect(saved.title).toContain(unit.title);
        expect(resultSchema.parse(saved)).toEqual(saved);
      }
    }
    for (const invalid of ["__proto__", "constructor", "unknown"]) expect(getGradeUnits(invalid, 4)).toEqual([]);
    expect(getGradeUnits("science", 5)).toEqual([]);
  });

  it("requires independent assessment content instead of falling back to practice questions", () => {
    expect(() => getAssessmentQuestions("missing-lesson", 2)).toThrow("independent");
    expect(() => getAssessmentQuestions("__proto__", 2)).toThrow("independent");
    expect(() => getAssessmentQuestions("number-builders", 4)).toThrow("complete");
  });

  it("merges every spelling topic and unit into Language & Reading without duplicating published topics", () => {
    const language = getGradeCourses("reading", 4);
    for (const lesson of getGradeCourses("spelling", 4)) {
      expect(getGradeCourse("reading", 4, lesson.slug)).toEqual(lesson);
    }
    for (const unit of getGradeUnits("spelling", 4)) {
      expect(getGradeCourse("reading", 4, unit.slug)).toBe(unit);
    }
    expect(subjects.reduce((total, subject) => total + getGradeCourses(subject, 4).length, 0)).toBe(69);
    expect(new Set(language.map((lesson) => lesson.slug)).size).toBe(19);
  });

  it("scores all topics in every end-of-lesson quiz and keeps result JSON compatible", () => {
    for (const subject of [...subjects, "spelling"]) {
      for (const lesson of getGradeCourses(subject, 4)) {
          const base = { kind: "quiz", attemptId, subject, grade: 4, lesson: lesson.slug };
          const questions = lesson.questions;
          const correct = scoreSubmission({ ...base, answers: questions.map((question) => question.answerIndex) }).result;
          expect(correct.score).toBe(questions.length);
          expect(correct.total).toBe(questions.length);
          expect(correct.title).toContain("Grade 4");
          expect(correct.sections[0].title).toBe("End-of-lesson quiz");
          expect(resultSchema.parse(correct)).toEqual(correct);
          const wrong = scoreSubmission({ ...base, answers: questions.map((question) => (question.answerIndex + 1) % question.options.length) }).result;
          expect(wrong.score).toBe(0);
          expect(() => scoreSubmission({ ...base, answers: [] })).toThrow();
          expect(() => scoreSubmission({ ...base, answers: questions.map(() => 20) })).toThrow("not valid");
      }
    }
  });

  it("rejects forged grades, sections, answer counts, and legacy-course substitution", () => {
    const lesson = getGradeCourses("math", 4)[0];
    const base = { kind: "quiz", attemptId, subject: "math", grade: 4, lesson: lesson.slug, answers: lesson.questions.map((question) => question.answerIndex) };
    for (const grade of [1, 3, 5, 8, 9]) expect(() => scoreSubmission({ ...base, grade })).toThrow();
    expect(() => scoreSubmission({ ...base, section: 50 })).toThrow("practice only");
    expect(() => scoreSubmission({ ...base, section: 0, answers: lesson.sections[0].questions!.map((question) => question.answerIndex) })).toThrow("practice only");
    expect(() => scoreSubmission({ ...base, grade: undefined })).toThrow("not valid");
    expect(() => scoreSubmission({ ...base, lesson: "fraction-detectives" })).toThrow("not valid");
    expect(() => scoreSubmission({ ...base, answers: [0] })).toThrow("not valid");
    expect(() => scoreSubmission({ ...base, score: 100 })).toThrow();
  });

  it("retains three ten-word French sets on vocabulary topics and preserves legacy matching", () => {
    const vocabulary = getGradeCourses("french", 4).filter((lesson) => lesson.frenchWords);
    expect(vocabulary).toHaveLength(3);
    for (const lesson of [...vocabulary, ...getGradeUnits("french", 4)]) {
      const words = lesson.frenchWords!;
      expect(words).toHaveLength(10);
      expect(new Set(words.map((word) => word.id)).size).toBe(10);
      const base = { kind: "matching", attemptId, grade: 4, lesson: lesson.slug, imageIds: words.map((word) => word.id) };
      expect(scoreSubmission(base).result.score).toBe(10);
      expect(scoreSubmission(base).result.title).toContain("Grade 4");
      expect(() => scoreSubmission({ ...base, grade: undefined })).toThrow("valid French");
      expect(() => scoreSubmission({ ...base, grade: 5 })).toThrow("valid French");
      expect(() => scoreSubmission({ ...base, imageIds: words.map(() => words[0].id) })).toThrow("exactly once");
    }
    const nonVocabulary = getGradeCourses("french", 4).find((lesson) => !lesson.frenchWords)!;
    expect(() => scoreSubmission({ kind: "matching", attemptId, grade: 4, lesson: nonVocabulary.slug, imageIds: [] })).toThrow();
  });
});
