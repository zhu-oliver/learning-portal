import { describe, expect, it } from "vitest";
import { getLesson, getSubject, subjects } from "./index";

describe("subject modules", () => {
  it("registers four subjects and retains spelling lookup for earlier quiz submissions", () => {
    expect(subjects.map((subject) => subject.slug)).toEqual(["math", "reading", "science", "french"]);
    expect(getSubject("spelling")?.activity).toBe("spelling");
    expect(new Set(subjects.map((subject) => subject.slug)).size).toBe(subjects.length);
    for (const subject of subjects) {
      expect(subject.slug).toMatch(/^[a-z0-9-]+$/);
      if (!subject.activity) expect(subject.lessons.length).toBeGreaterThan(0);
      expect(new Set(subject.lessons.map((lesson) => lesson.slug)).size).toBe(subject.lessons.length);
    }
  });

  it("gives every lesson useful content and a valid, unique quiz", () => {
    for (const subject of subjects) {
      for (const lesson of subject.lessons) {
        expect(lesson.slug).toMatch(/^[a-z0-9-]+$/);
        expect(lesson.durationMinutes).toBeGreaterThan(0);
        if (lesson.frenchWords) {
          const count = lesson.slug === "classroom" ? 24 : 10;
          expect(lesson.frenchWords).toHaveLength(count);
          expect(new Set(lesson.frenchWords.map((word) => word.id)).size).toBe(count);
          expect(new Set(lesson.frenchWords.map((word) => word.french)).size).toBe(count);
          expect(new Set(lesson.frenchWords.map((word) => word.english)).size).toBe(count);
          for (const word of lesson.frenchWords) {
            expect(word.french).toMatch(/^(le |la |les |un |une |des |l')/);
            expect(word.note.length).toBeGreaterThan(10);
          }
          continue;
        }
        expect(lesson.sections.length).toBeGreaterThanOrEqual(3);
        expect(lesson.questions.length).toBeGreaterThanOrEqual(3);
        expect(new Set(lesson.questions.map((question) => question.id)).size).toBe(lesson.questions.length);
        for (const question of lesson.questions) {
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(new Set(question.options).size).toBe(question.options.length);
          expect(Number.isInteger(question.answerIndex)).toBe(true);
          expect(question.answerIndex).toBeGreaterThanOrEqual(0);
          expect(question.answerIndex).toBeLessThan(question.options.length);
          expect(question.explanation.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it("resolves only registered subjects and lessons", () => {
    expect(getSubject("math")).toBe(subjects[0]);
    expect(getLesson("math", "fraction-detectives")).toBe(subjects[0].lessons[0]);
    expect(getSubject("unknown")).toBeUndefined();
    expect(getSubject("__proto__")).toBeUndefined();
    expect(getLesson("math", "unknown")).toBeUndefined();
    expect(getLesson("unknown", "fraction-detectives")).toBeUndefined();
  });
});
