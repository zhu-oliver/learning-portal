import { describe, expect, it } from "vitest";
import { french } from "@/modules/french";
import { resultSchema, scoreSubmission } from "./results";

const attemptId = "10000000-0000-4000-8000-000000000001";

describe("French matching result validation", () => {
  it.each(french.lessons)("scores all registered $slug images by ID, independent of displayed order", (lesson) => {
    const images = lesson.frenchWords!.map((word) => word.id);
    const correct = scoreSubmission({ kind: "matching", attemptId, lesson: lesson.slug, imageIds: images }).result;
    expect(correct.score).toBe(images.length);
    expect(correct.total).toBe(images.length);
    expect(correct.sections[0].items).toHaveLength(images.length);
    expect(resultSchema.parse(correct)).toEqual(correct);
    const wrong = scoreSubmission({ kind: "matching", attemptId, lesson: lesson.slug, imageIds: [...images.slice(1), images[0]] }).result;
    expect(wrong.score).toBe(0);
    expect(wrong.sections[0].items[0].expected).toBe(lesson.frenchWords![0].english);
  });

  it("preserves the requested classroom order with standard French spelling and 24 unique pictures", () => {
    const lesson = french.lessons.find((lesson) => lesson.slug === "classroom")!;
    expect(lesson.title).toBe("Dans ma salle de classe...");
    const words = lesson.frenchWords!;
    expect(words.map((word) => word.french)).toEqual([
      "des élèves", "un pupitre", "un cahier", "une chaise", "un sac à dos",
      "des boîtes à lunch", "la porte", "un taille-crayon", "une école", "un marqueur",
      "un stylo", "une poubelle", "un enseignant", "une enseignante", "un crayon",
      "un crayon de cire", "des ciseaux", "une gomme", "des livres", "un bâton de colle",
      "un ordinateur", "des crayons de couleur", "une règle", "les lumières",
    ]);
    expect(new Set(words.map((word) => word.id)).size).toBe(24);
    expect(words.every((word) => word.english && word.note)).toBe(true);
    const imageIds = words.map((word) => word.id);
    const base = { kind: "matching", attemptId, lesson: lesson.slug, imageIds };
    expect(() => scoreSubmission({ ...base, imageIds: imageIds.slice(0, 10) })).toThrow("24 images");
    expect(() => scoreSubmission({ ...base, imageIds: imageIds.slice(0, 23) })).toThrow("24 images");
    expect(() => scoreSubmission({ ...base, imageIds: [...imageIds, "cat"] })).toThrow("24 images");
    expect(() => scoreSubmission({ ...base, imageIds: [...imageIds.slice(0, 23), "students"] })).toThrow("exactly once");
    expect(() => scoreSubmission({ ...base, imageIds: [...imageIds.slice(0, 23), "cat"] })).toThrow("exactly once");
    expect(() => scoreSubmission({ ...base, grade: 4 })).toThrow("valid French");
    expect(() => scoreSubmission({ ...base, score: 24 })).toThrow();
    expect(() => scoreSubmission({ ...base, imageIds: Array(51).fill("students") })).toThrow();
    expect(french.lessons.filter((item) => item.slug !== "classroom").map((item) => item.frenchWords!.length)).toEqual([10, 10, 10]);
  });

  it("rejects incomplete, duplicate, unrelated, or forged matches", () => {
    const imageIds = french.lessons[0].frenchWords!.map((word) => word.id);
    const base = { kind: "matching", attemptId, lesson: "animals", imageIds };
    expect(() => scoreSubmission({ ...base, imageIds: imageIds.slice(0, 9) })).toThrow();
    expect(() => scoreSubmission({ ...base, imageIds: Array(10).fill("cat") })).toThrow("exactly once");
    expect(() => scoreSubmission({ ...base, imageIds: [...imageIds.slice(0, 9), "apple"] })).toThrow("exactly once");
    expect(() => scoreSubmission({ ...base, lesson: "missing" })).toThrow("valid French");
    expect(() => scoreSubmission({ ...base, score: 10 })).toThrow();
    expect(() => scoreSubmission({ kind: "quiz", attemptId, subject: "french", lesson: "animals", answers: [0] })).toThrow("not valid");
  });

  it("preserves backwards compatibility with saved spelling and lesson quizzes", () => {
    const quiz = scoreSubmission({ kind: "quiz", attemptId, subject: "math", lesson: "fraction-detectives", answers: [1, 2, 0] }).result;
    expect(resultSchema.parse(quiz).kind).toBe("quiz");
    const spelling = scoreSubmission({ kind: "spelling", attemptId, listId: "custom", words: ["apple"], answers: ["apple"], vocabularyAnswers: [] }).result;
    expect(resultSchema.parse(spelling).kind).toBe("spelling");
  });
});
