import { describe, expect, it } from "vitest";
import { readingGradeContent } from "../reading";
import { expectedProblemAnswer, problemIsCorrect, problemSolution, wordAtPath, wordSearchPath } from "../../problems";
import { correctQuizAnswers, quizEntries, scoreQuizEntry, validateInteractiveAnswer } from "../../quiz-entries";
import type { Lesson } from "../../types";

// Independent ministry enumerations fetched from each course's specific-expectation
// records, not computed from our content, Grade 4, or the lesson maps.
const officialCounts = { 1: 63, 2: 61, 3: 61, 5: 59, 6: 59, 7: 59, 8: 59 } as const;
const officialRanges = {
  1: [2, 7, 3, 5, 8, 3, 7, 7, 8, 5, 5, 3],
  2: [2, 7, 3, 5, 5, 3, 7, 7, 8, 5, 6, 3],
  3: [2, 7, 3, 5, 5, 3, 7, 7, 8, 5, 6, 3],
  5: [2, 7, 3, 5, 3, 3, 7, 7, 8, 5, 6, 3],
  6: [2, 7, 3, 5, 3, 3, 7, 7, 8, 5, 6, 3],
  7: [2, 7, 3, 5, 3, 3, 7, 7, 8, 5, 6, 3],
  8: [2, 7, 3, 5, 3, 3, 7, 7, 8, 5, 6, 3],
} as const;
const prefixes = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "D3"];
const grades = [1, 2, 3, 5, 6, 7, 8] as const;
const mappedBody = (lessons: readonly Lesson[], id: string) =>
  lessons.flatMap((lesson) => lesson.sections.filter((section) => section.expectations?.includes(id)).map((section) => section.body)).join(" ");
const finalCorrect = (lesson: Lesson, index: number) => lesson.questions[index].options[lesson.questions[index].answerIndex];
const lessonNamed = (grade: number, suffix: string) => {
  const lesson = readingGradeContent[grade]!.lessons.find((entry) => entry.slug === `g${grade}-${suffix}`);
  expect(lesson).toBeDefined();
  return lesson!;
};

describe("Ontario 2023 Language: independently verified grade content", () => {
  it("exports only the seven requested grades and does not replace Grade 4", () => {
    expect(Object.keys(readingGradeContent).map(Number)).toEqual([...grades]);
    expect(readingGradeContent[4]).toBeUndefined();
  });

  for (const grade of grades) {
    it(`Grade ${grade}: matches its own official enumeration and teaches every specific expectation`, () => {
      const content = readingGradeContent[grade]!;
      const officialIds = prefixes.flatMap((prefix, index) =>
        Array.from({ length: officialRanges[grade][index] }, (_, i) => `${prefix}.${i + 1}`));
      expect(officialIds).toHaveLength(officialCounts[grade]);
      expect(content.expectations.map(([id]) => id).sort()).toEqual(officialIds.sort());
      expect(new Set(content.expectations.map(([id]) => id)).size).toBe(officialCounts[grade]);
      expect(content.edition).toBe(2023);
      expect(content.source).toBe(`https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language/grades/grade-${grade}/strands`);
      expect(content.lessons).toHaveLength(grade <= 3 ? 22 : 21);
      expect(Object.keys(content.activities).sort()).toEqual(content.lessons.map((lesson) => lesson.slug).sort());
      for (const [id, focus] of content.expectations) {
        expect(focus.length, id).toBeGreaterThan(20);
        expect(mappedBody(content.lessons, id).length, `${grade}: ${id}`).toBeGreaterThan(500);
      }
      for (const lesson of content.lessons) {
        expect(lesson.sections).toHaveLength(3);
        expect(new Set(lesson.sections.map((section) => section.heading)).size).toBe(3);
        expect(lesson.sections.map((section) => section.body).join("").length, lesson.slug).toBeGreaterThan(1500);
        expect(lesson.grade).toBe(grade);
        expect(lesson.source).toBe(content.source);
        expect(lesson.strand).toMatch(/^[ABCD]$/);
        expect(lesson.unitSlug).toMatch(new RegExp(`^g${grade}-`));
        expect(lesson.unitTitle!.length).toBeGreaterThan(5);
        expect(lesson.slug).toMatch(new RegExp(`^g${grade}-[a-z0-9-]+$`));
        expect(lesson.slug.length).toBeLessThanOrEqual(80);
        const mapped = [...new Set(lesson.sections.flatMap((section) => section.expectations ?? []))].sort();
        expect([...lesson.expectations!].sort()).toEqual(mapped);
        for (const section of lesson.sections) {
          expect(section.body.length, `${lesson.slug}: ${section.heading}`).toBeGreaterThan(250);
          expect(section.activity!.length).toBeGreaterThan(100);
          expect(section.activity).toMatch(/adult|librarian/);
          expect(section.questions!.length).toBeGreaterThanOrEqual(1);
          for (const id of section.expectations!) expect(officialIds).toContain(id);
        }
        expect(lesson.questions).toHaveLength(4);
        expect(lesson.questions.map((question) => question.sectionIndex)).toEqual([0, 0, 1, 2]);
        const allQuestions = [...lesson.sections.flatMap((section) => section.questions!), ...lesson.questions];
        expect(new Set(allQuestions.map((question) => question.id)).size).toBe(allQuestions.length);
        expect(new Set(allQuestions.map((question) => question.prompt)).size).toBe(allQuestions.length);
        for (const question of allQuestions) {
          expect(question.options).toHaveLength(3);
          expect(new Set(question.options).size).toBe(3);
          expect(question.answerIndex).toBeGreaterThanOrEqual(0);
          expect(question.answerIndex).toBeLessThan(question.options.length);
          expect(question.explanation.length).toBeGreaterThan(35);
        }
        expect(new Set(lesson.questions.map((question) => question.answerIndex)).size).toBe(3);
        const activities = content.activities[lesson.slug];
        expect(activities, lesson.slug).toHaveLength(3);
        expect(new Set(activities.map((activity) => JSON.stringify(activity))).size).toBe(3);
        expect(new Set(activities.map((activity) => activity.id)).size).toBe(3);
        const entries = quizEntries(lesson.questions, activities.slice(1));
        expect(entries).toHaveLength(6);
        expect(entries.map((entry) => entry.kind)).toEqual(["choice", "interactive", "choice", "interactive", "choice", "choice"]);
        const answers = correctQuizAnswers(entries);
        expect(entries.filter((entry, index) => scoreQuizEntry(entry, answers[index]).correct)).toHaveLength(6);
        expect(() => scoreQuizEntry(entries[0], -1)).toThrow();
        expect(() => scoreQuizEntry(entries[0], [])).toThrow();
        expect(() => scoreQuizEntry(entries[1], 0)).toThrow();
        const legacy = quizEntries(lesson.questions);
        expect(legacy.filter((entry, index) => scoreQuizEntry(entry, correctQuizAnswers(legacy)[index]).correct)).toHaveLength(4);
        for (const activity of activities) {
          expect(activity.explanation.length).toBeGreaterThan(30);
          expect(problemIsCorrect(activity, expectedProblemAnswer(activity))).toBe(true);
          expect(() => validateInteractiveAnswer(activity, expectedProblemAnswer(activity))).not.toThrow();
          expect(() => validateInteractiveAnswer(activity, [])).toThrow();
          if (activity.type === "fill") {
            expect(() => validateInteractiveAnswer(activity, ["x".repeat(121)])).toThrow();
          } else {
            const malformed = expectedProblemAnswer(activity).map(() => "nonexistent-item");
            expect(() => validateInteractiveAnswer(activity, malformed)).toThrow();
          }
          expect(problemIsCorrect(activity, ["incorrect-test-answer"])).toBe(false);
          expect(problemSolution(activity).length).toBeGreaterThan(0);
          if (activity.type === "pairs") {
            expect(new Set(activity.right.map((item) => item.id)).size).toBe(activity.right.length);
            for (const match of activity.matches) expect(activity.right.some((item) => item.id === match)).toBe(true);
          }
          if (activity.type === "sequence") {
            expect([...activity.order].sort()).toEqual(activity.items.map((item) => item.id).sort());
          }
          if (activity.type === "word-search") {
            const width = activity.grid[0].length;
            for (const word of activity.words) {
              let found = false;
              for (let start = 0; start < width * activity.grid.length; start++) {
                for (let end = 0; end < width * activity.grid.length; end++) {
                  if (wordAtPath(activity.grid, wordSearchPath(activity.grid, start, end)) === word.text) found = true;
                }
              }
              expect(found, word.text).toBe(true);
            }
          }
        }
      }
    });
  }

  it("keeps slugs unique and offers different meaningful interaction types", () => {
    const content = grades.map((grade) => readingGradeContent[grade]!);
    const slugs = content.flatMap((grade) => grade.lessons.map((lesson) => lesson.slug));
    expect(new Set(slugs).size).toBe(150);
    const types = new Set(content.flatMap((grade) => Object.values(grade.activities).flatMap((bank) => bank.map((problem) => problem.type))));
    expect([...types].sort()).toEqual(["fill", "pairs", "sequence", "sort", "spelling-highlight", "word-search"].sort());
  });

  it("teaches independently verified phonics, source thresholds, and handwriting progressions", () => {
    expect(mappedBody(readingGradeContent[1]!.lessons, "B2.1")).toContain("at as two sounds");
    expect(mappedBody(readingGradeContent[1]!.lessons, "B2.2")).toContain("shuffled upper/lowercase");
    expect(mappedBody(readingGradeContent[1]!.lessons, "B2.3")).toContain("sh represent one sound");
    expect(mappedBody(readingGradeContent[2]!.lessons, "B2.1")).toContain("set for variability");
    expect(mappedBody(readingGradeContent[3]!.lessons, "B2.1")).toContain("Consolidated phonics");
    expect(mappedBody(readingGradeContent[1]!.lessons, "D1.3")).toContain("one relevant source");
    for (const grade of [2, 3]) expect(mappedBody(readingGradeContent[grade]!.lessons, "D1.3")).toContain("at least three");
    expect(mappedBody(readingGradeContent[3]!.lessons, "D2.2")).toContain("Begin cursive");
    expect(mappedBody(readingGradeContent[5]!.lessons, "D2.2")).toContain("begin automatic keyboarding");
    expect(mappedBody(readingGradeContent[8]!.lessons, "D2.2")).toContain("tracked revisions");
  });

  it("matches grade-specific grammar, narrator, and literary-device demands", () => {
    const markers = {
      1: ["singular common noun", "alliteration"],
      2: ["collective noun", "consonance"],
      3: ["progressive verb", "assonance"],
      5: ["correlative conjunction", "sensory imagery"],
      6: ["gerund", "hyperbole"],
      7: ["indirect object", "allegory"],
      8: ["participial phrase", "satire"],
    };
    for (const grade of grades) {
      expect(mappedBody(readingGradeContent[grade]!.lessons, "B3.2")).toContain(markers[grade][0]);
      expect(mappedBody(readingGradeContent[grade]!.lessons, "C3.1")).toContain(markers[grade][1]);
    }
    expect(mappedBody(readingGradeContent[5]!.lessons, "B3.1")).toContain("compound-complex");
    expect(mappedBody(readingGradeContent[6]!.lessons, "B3.1")).toContain("relative clause");
    expect(mappedBody(readingGradeContent[7]!.lessons, "B3.3")).toContain("conjunctive adverb");
    expect(mappedBody(readingGradeContent[8]!.lessons, "C1.6")).toContain("unreliable");
    expect(mappedBody(readingGradeContent[8]!.lessons, "C3.7")).toContain("Compare at least two works");
    expect(mappedBody(readingGradeContent[7]!.lessons, "A2.3")).toContain("disinformation");
    expect(mappedBody(readingGradeContent[8]!.lessons, "A2.3")).toContain("Curated information");
  });

  it("checks original worked-example answers rather than only self-consistent answer indices", () => {
    for (const grade of grades) {
      const listen = lessonNamed(grade, "listen-clarify-and-remember");
      expect(finalCorrect(listen, 0)).toBe("Place the folder on its shelf, then bring the tray to the table.");
      expect(finalCorrect(listen, 1)).toBe("The cup action happens before washing the spoon.");
      const fluency = lessonNamed(grade, "fluent-reading-with-meaning");
      expect(finalCorrect(fluency, 0)).toBe("Reading blocked as booked.");
      const plan = lessonNamed(grade, "planning-research-and-organizing-content");
      expect(finalCorrect(plan, 2)).toBe("They are distinct identified documents with different creators or purposes.");
      const edit = lessonNamed(grade, "handwriting-revision-editing-and-proofreading");
      expect(finalCorrect(edit, 3)).toBe("Changes can introduce new errors.");
      const bank = readingGradeContent[grade]!.activities[edit.slug];
      expect(bank[0].type).toBe("spelling-highlight");
      const highlight = bank[0];
      if (highlight.type === "spelling-highlight") {
        expect(highlight.incorrect.map((index) => highlight.tokens[index])).toEqual(["raed", "stroy"]);
      }
      expect(problemSolution(bank[1])).toBe("read");
    }
    const grade6Grammar = lessonNamed(6, "grammar-roles-and-precision");
    expect(finalCorrect(grade6Grammar, 3)).toBe("The intended meaning and clarity for the audience.");
    expect(grade6Grammar.sections[2].questions![0].options[grade6Grammar.sections[2].questions![0].answerIndex]).toBe("The club painted the mural.");
    const grade8Devices = lessonNamed(8, "literary-devices-and-effects");
    expect(grade8Devices.sections[0].questions![0].options[grade8Devices.sections[0].questions![0].answerIndex]).toBe("irony");
  });
});
