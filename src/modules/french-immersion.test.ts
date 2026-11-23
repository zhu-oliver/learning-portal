import { describe, expect, it } from "vitest";
import { grade2ImmersionLessons, immersionSource } from "./french-immersion";
import { getGradeCourse, getGradeCourses, parseImmersionGrade } from "./curriculum";
import { scoreSubmission, summarizeResult } from "@/lib/results";

const attemptId = "10000000-0000-4000-8000-000000000001";

describe("Ontario Grade 2 French Immersion", () => {
  it("maps all 39 specific expectations independently enumerated from the official 2013 Grade 2 chapter", () => {
    const ranges = { A1: 4, A2: 3, A3: 2, B1: 4, B2: 3, B3: 2, C1: 5, C2: 3, C3: 2, D1: 5, D2: 4, D3: 2 };
    const expected = Object.entries(ranges).flatMap(([prefix, count]) => Array.from({ length: count }, (_, index) => `${prefix}.${index + 1}`)).sort();
    const mapped = [...new Set(grade2ImmersionLessons.flatMap((lesson) => lesson.sections.flatMap((section) => section.expectations)))].sort();
    expect(expected).toHaveLength(39);
    expect(mapped).toEqual(expected);
    expect(immersionSource).toBe("https://www.edu.gov.on.ca/eng/curriculum/elementary/fsl18-2013curr.pdf#page=217");
  });

  it("separates immersion lookup from Core French in every grade", () => {
    expect(getGradeCourses("french", 2)).toEqual([]);
    expect(getGradeCourses("french", 2, "immersion")).toBe(grade2ImmersionLessons);
    expect(getGradeCourses("french", 4)).toHaveLength(12);
    expect(getGradeCourses("french", 4, "immersion").length).toBeGreaterThan(0);
    expect(getGradeCourses("math", 2, "immersion")).toEqual([]);
    expect(getGradeCourse("french", 2, grade2ImmersionLessons[0].slug)).toBeUndefined();
    expect(parseImmersionGrade("immersion-grade-2")).toBe(2);
    for (const invalid of ["grade-2", "immersion-grade-0", "immersion-grade-9", "immersion-grade-02"]) expect(parseImmersionGrade(invalid)).toBeUndefined();
  });

  it.each(grade2ImmersionLessons)("provides complete French-first instruction and distinct section-aligned quizzes for $title", (lesson) => {
    expect(lesson).toMatchObject({ grade: 2, program: "immersion", durationMinutes: 25, source: immersionSource });
    expect(lesson.sections).toHaveLength(3);
    expect(lesson.questions).toHaveLength(3);
    const practice = new Set(lesson.sections.flatMap((section) => section.questions.map((question) => question.prompt)));
    for (const [index, section] of lesson.sections.entries()) {
      expect(section.body.length).toBeGreaterThan(300);
      expect(section.activity.length).toBeGreaterThan(120);
      expect(section.englishHelp.length).toBeGreaterThan(100);
      expect(section.expectations.length).toBeGreaterThan(0);
      expect(section.questions).toHaveLength(1);
      expect(lesson.questions[index].sectionIndex).toBe(index);
      expect(practice.has(lesson.questions[index].prompt)).toBe(false);
    }
    expect(new Set([...lesson.questions, ...lesson.sections.flatMap((section) => section.questions)].map((question) => question.id)).size).toBe(6);
    for (const question of [...lesson.questions, ...lesson.sections.flatMap((section) => section.questions)]) {
      expect(question.options).toHaveLength(3);
      expect(new Set(question.options).size).toBe(3);
      expect(question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex).toBeLessThan(3);
      expect(question.explanation.length).toBeGreaterThan(20);
    }
    const result = scoreSubmission({
      kind: "quiz", attemptId, subject: "french", grade: 2, program: "immersion",
      lesson: lesson.slug, answers: lesson.questions.map((question) => question.answerIndex),
    }).result;
    expect(result).toMatchObject({ score: 3, total: 3, subject: "French Immersion" });
    expect(result.title).toContain("Grade 2");
    expect(summarizeResult(result)).not.toHaveProperty("sections");
  });

  it("rejects wrong programs, grades, forged scores and section-practice saves", () => {
    const lesson = grade2ImmersionLessons[0];
    const base = { kind: "quiz", attemptId, subject: "french", grade: 2, program: "immersion", lesson: lesson.slug, answers: [0, 0, 1] };
    for (const overrides of [{ program: "core" }, { program: "unknown" }, { grade: 4 }, { subject: "math" }, { score: 3 }, { section: 0 }, { answers: [] }]) {
      expect(() => scoreSubmission({ ...base, ...overrides })).toThrow();
    }
  });
});
