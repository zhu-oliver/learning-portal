import { describe, expect, it } from "vitest";
import { scoreSubmission } from "./results";
import { math } from "@/modules/math";
import { getSpellingList, parseCustomWords, spellingLists } from "@/modules/spelling";

const attemptId = "10000000-0000-4000-8000-000000000001";

describe("server-authoritative results", () => {
  it("scores subject quizzes using the registered answer keys", () => {
    const { result } = scoreSubmission({ kind: "quiz", attemptId, subject: "math", lesson: "fraction-detectives", answers: math.lessons[0].questions.map((question) => question.answerIndex) });
    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.title).toBe("Fraction detectives");
  });

  it.each(spellingLists)("scores spelling and vocabulary for $title", (list) => {
    const { result } = scoreSubmission({
      kind: "spelling", attemptId, listId: list.id,
      answers: list.words.map((word) => ` ${word.toUpperCase()} `),
      vocabularyAnswers: list.vocabulary.map((question) => question.answerIndex),
    });
    expect(result.score).toBe(list.words.length + list.vocabulary.length);
    expect(result.total).toBe(list.words.length + list.vocabulary.length);
    expect(result.sections.map((section) => section.score)).toEqual([list.words.length, list.vocabulary.length]);
  });

  it("handles blanks, incorrect spelling, and custom words", () => {
    const { result } = scoreSubmission({
      kind: "spelling", attemptId, listId: "custom", words: ["neighbor", "rhythm"],
      answers: ["", "rithm"], vocabularyAnswers: [],
    });
    expect(result.score).toBe(0);
    expect(result.total).toBe(2);
    expect(result.sections).toHaveLength(1);
  });

  it("normalizes and deduplicates custom words while rejecting invalid input", () => {
    expect(parseCustomWords(" Apple,\napple; pear \n")).toEqual(["apple", "pear"]);
    expect(() => parseCustomWords("")).toThrow("between 1 and 50");
    expect(() => parseCustomWords("hello world")).toThrow("English words");
    expect(() => parseCustomWords("<script>")).toThrow("English words");
    expect(() => parseCustomWords("a".repeat(41))).toThrow("40 characters");
    expect(() => parseCustomWords(Array.from({ length: 51 }, (_, index) => `word${index}`).join(","))).toThrow("between 1 and 50");
    expect(getSpellingList("missing")).toBeUndefined();
  });

  it("rejects forged scores, replaced predefined words, missing answers and invalid choices", () => {
    const base = { kind: "spelling", attemptId, listId: "test-1", answers: [...spellingLists[0].words], vocabularyAnswers: spellingLists[0].vocabulary.map((question) => question.answerIndex) };
    expect(() => scoreSubmission({ ...base, score: 100 })).toThrow();
    expect(() => scoreSubmission({ ...base, words: ["easy"] })).toThrow("cannot be replaced");
    expect(() => scoreSubmission({ ...base, answers: ["neighbor"] })).toThrow("every spelling word");
    expect(() => scoreSubmission({ ...base, vocabularyAnswers: [] })).toThrow("every vocabulary");
    expect(() => scoreSubmission({ ...base, vocabularyAnswers: [10, ...base.vocabularyAnswers.slice(1)] })).toThrow("not valid");
    expect(() => scoreSubmission({ ...base, listId: "missing" })).toThrow("valid spelling list");
    expect(() => scoreSubmission({ ...base, attemptId: "invalid" })).toThrow();
    expect(() => scoreSubmission({ ...base, userId: "someone-else" })).toThrow();
  });

  it("rejects invalid quiz routes, answer counts and duplicate custom words", () => {
    const base = { kind: "quiz", attemptId, subject: "math", lesson: "fraction-detectives", answers: [1, 2, 0] };
    expect(() => scoreSubmission({ ...base, subject: "missing" })).toThrow("not valid");
    expect(() => scoreSubmission({ ...base, answers: [1] })).toThrow("not valid");
    expect(() => scoreSubmission({ ...base, answers: [10, 2, 0] })).toThrow("not valid");
    expect(() => scoreSubmission({ kind: "spelling", attemptId, listId: "custom", words: ["apple", "apple"], answers: ["apple", "apple"], vocabularyAnswers: [] })).toThrow("unique");
  });
});
