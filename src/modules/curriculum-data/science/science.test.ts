import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scienceGradeContent } from "../science";
import { expectedProblemAnswer, problemIsCorrect, wordAtPath, wordSearchPath, type Problem } from "../../problems";

// Independent transcription of the numbered ministry 2022 PDF lists, not inferred
// from the lessons or exported registry. Verified against the full 179-page PDF.
const official: Record<number, readonly number[]> = {
  1: [44, 5, 2, 3, 2, 6, 2, 6, 2, 8, 2, 6],
  2: [41, 5, 2, 3, 2, 5, 2, 7, 2, 5, 3, 5],
  3: [44, 5, 2, 3, 3, 8, 2, 4, 2, 7, 2, 6],
  5: [42, 5, 2, 3, 3, 4, 2, 7, 2, 5, 3, 6],
  6: [44, 5, 2, 3, 2, 8, 2, 7, 1, 5, 3, 6],
  7: [50, 5, 2, 3, 3, 8, 2, 8, 2, 7, 2, 8],
  8: [52, 5, 2, 3, 2, 6, 2, 10, 2, 10, 3, 7],
};
const prefixes = ["A1", "A2", "A3", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2"];

// Content anchors independently selected from actual grade-specific expectations.
// Verify concepts in the mapped sections, not just existence of an ID somewhere.
const anchors: Record<number, readonly (readonly [string, RegExp])[]> = {
  1: [["B2.4", /Eyes.*head.*light/], ["C2.2", /Sun.*light.*warms/], ["D2.7", /Tape.*glue.*clips/], ["E2.1", /tilted axis/]],
  2: [["B2.3", /egg, larva, pupa, and adult/], ["C2.7", /corrosion symbol/], ["D2.3", /wheel and axle.*screw/], ["E2.3", /evaporate.*condense/]],
  3: [["B2.2", /stamens.*pollen.*pistil/], ["B2.5", /carbon dioxide.*oxygen/], ["D2.7", /strut.*compression.*tie.*tension/], ["E2.6", /Composting.*decomposers/]],
  5: [["B2.3", /Lungs.*blood.*heart/], ["C2.5", /clues, not proof/], ["D2.1", /Compression.*tension.*shear.*torsion/], ["E2.6", /carbon dioxide.*greenhouse/]],
  6: [["B2.2", /within a species.*species in a community.*habitats/], ["C2.7", /Parallel.*branch/], ["D2.2", /Lift.*weight.*thrust.*drag/], ["E2.2", /kilograms.*newtons/]],
  7: [["B2.6", /Primary succession.*soil is initially absent/], ["C2.5", /five grams.*hundred millilitres.*0\.05/], ["D2.3", /magnitude, direction, point.*plane/], ["E2.7", /infrared.*Greenhouse gases/]],
  8: [["B2.4", /Osmosis.*selectively permeable membrane/], ["C2.7", /Pascal.*40 newtons/], ["D2.5", /10-newton.*two metres.*20 joules/], ["E2.7", /disinfection.*Wastewater/]],
};

const oracle: readonly (readonly [number, string, string])[] = [
  [1, "A toy car moves across the floor. Does that prove it is alive?", "No; movement alone does not show living needs"],
  [1, "What causes night at a place on Earth?", "That place faces away from the Sun as Earth turns"],
  [2, "Sand pours from a cup. Why can its grains still be solid?", "Each grain keeps its own shape"],
  [2, "What follows the larval stage in a butterfly's complete metamorphosis?", "Pupa"],
  [3, "A book rests on a table. Which explanation is accurate?", "Downward gravity and upward support can balance"],
  [3, "Why can a stretched string act as a tie but not a strut?", "It resists pulling but cannot support a pushing load while slack"],
  [5, "Torn paper is difficult to restore. Does that make tearing chemical?", "No; a new substance has not been established"],
  [5, "A rolling toy stops. Has its energy been destroyed?", "No; energy was transferred, including to surroundings"],
  [6, "Does attraction to a charged comb prove the paper has opposite net charge?", "No; a neutral object's charges can shift"],
  [6, "What usually explains Moon phases?", "Changing views of the Moon's sunlit half"],
  [7, "What is the concentration of 6 g in 200 mL of solution?", "0.03 g/mL"],
  [7, "How does sunlight transfer energy across nearly empty space?", "By radiation"],
  [8, "What is the density of 18 g occupying 6 cm³?", "3 g/cm³"],
  [8, "What is the average volumetric flow rate of 150 mL in 50 s?", "3 mL/s"],
  [8, "An ideal input pressure is 4 N/cm² and output area is 6 cm². What output force is predicted?", "24 N"],
  [8, "What work is done by an aligned 8 N force over 3 m?", "24 J"],
  [8, "A system produces 90 N output from 30 N input. What is its mechanical advantage?", "3"],
  [8, "A system outputs 45 J usefully from 60 J input. What efficiency is this?", "75%"],
];

describe("Ontario 2022 science: seven independently verified grades", () => {
  it("matches the actual ministry-specific IDs and counts for each grade", () => {
    expect(Object.keys(scienceGradeContent).map(Number)).toEqual([1, 2, 3, 5, 6, 7, 8]);
    for (const [gradeText, [count, ...ranges]] of Object.entries(official)) {
      const content = scienceGradeContent[Number(gradeText)]!;
      const expected = prefixes.flatMap((prefix, i) => Array.from({ length: ranges[i] }, (_, n) => `${prefix}.${n + 1}`));
      expect(content.expectations).toHaveLength(count);
      expect(content.expectations.map(([id]) => id).sort()).toEqual(expected.sort());
      expect(content.edition).toBe(2022);
      expect(content.source).toBe(`https://www.dcp.edu.gov.on.ca/en/curriculum/science-technology/grades/grade-${gradeText}/strands`);
      expect(content.expectations.every(([, focus]) => focus.length > 25)).toBe(true);
    }
  });

  it("has deep teaching, complete section coverage, metadata, and independent valid MC quizzes", () => {
    const slugs = new Set<string>();
    for (const [gradeText, content] of Object.entries(scienceGradeContent)) {
      const declared = new Set(content!.expectations.map(([id]) => id));
      const mapped = new Set<string>();
      expect(content!.lessons.length).toBeGreaterThanOrEqual(12);
      expect(content!.lessons.length).toBeLessThanOrEqual(18);
      for (const lesson of content!.lessons) {
        expect(lesson.slug).toMatch(new RegExp(`^g${gradeText}-[a-z0-9-]{1,76}$`));
        expect(slugs.has(lesson.slug)).toBe(false);
        slugs.add(lesson.slug);
        expect(lesson.grade).toBe(Number(gradeText));
        expect(lesson.source).toBe(content!.source);
        expect(lesson.unitSlug).toMatch(new RegExp(`^g${gradeText}-[a-e]$`));
        expect(lesson.unitTitle).toBeTruthy();
        expect(lesson.strand).toMatch(/^[A-E] · /);
        expect(lesson.sections).toHaveLength(3);
        expect.soft(lesson.sections.reduce((n, section) => n + section.body.length, 0), lesson.slug).toBeGreaterThan(1500);
        for (const section of lesson.sections) {
          expect(section.body.length, `${lesson.slug}/${section.heading}`).toBeGreaterThan(250);
          expect(section.activity!.length).toBeGreaterThan(100);
          expect(section.activity).toMatch(/adult/i);
          expect(section.questions!.length).toBeGreaterThanOrEqual(1);
          expect(section.expectations!.length).toBeGreaterThan(0);
          for (const id of section.expectations!) {
            expect(declared.has(id), `${lesson.slug}: ${id}`).toBe(true);
            mapped.add(id);
          }
        }
        expect(lesson.expectations).toEqual([...new Set(lesson.sections.flatMap((section) => section.expectations!))]);
        expect(lesson.questions).toHaveLength(4);
        expect(lesson.questions.map((q) => q.sectionIndex)).toEqual([0, 0, 1, 2]);
        const questions = [...lesson.sections.flatMap((section) => section.questions!), ...lesson.questions];
        expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
        expect(new Set(questions.map((q) => q.prompt)).size).toBe(questions.length);
        for (const question of questions) {
          expect(question.options).toHaveLength(3);
          expect(new Set(question.options).size).toBe(3);
          expect(question.answerIndex).toBeGreaterThanOrEqual(0);
          expect(question.answerIndex).toBeLessThan(3);
          expect(question.explanation.length).toBeGreaterThan(20);
        }
      }
      expect([...mapped].sort()).toEqual([...declared].sort());
      for (const [id, anchor] of anchors[Number(gradeText)]) {
        const bodies = content!.lessons.flatMap((lesson) => lesson.sections)
          .filter((section) => section.expectations!.includes(id)).map((section) => section.body).join(" ");
        expect(bodies, `Grade ${gradeText}: ${id}`).toMatch(anchor);
      }
    }
  });

  it("checks independent conceptual and numerical answer oracles", () => {
    for (const [grade, prompt, correct] of oracle) {
      const question = scienceGradeContent[grade]!.lessons.flatMap((lesson) => lesson.questions).find((q) => q.prompt === prompt);
      expect(question, prompt).toBeDefined();
      expect(question!.options[question!.answerIndex], prompt).toBe(correct);
    }
  });

  it("has complete and correctly keyed interactive activities, including an original diagram", () => {
    const kinds = new Set<string>();
    for (const content of Object.values(scienceGradeContent)) {
      expect(Object.keys(content!.activities).sort()).toEqual(content!.lessons.map((lesson) => lesson.slug).sort());
      for (const lesson of content!.lessons) {
        const activities = content!.activities[lesson.slug];
        expect(activities).toHaveLength(3);
        expect(new Set(activities.map((problem) => problem.id)).size).toBe(3);
        expect(new Set(activities.map((problem) => problem.prompt)).size).toBe(3);
        for (const problem of activities) {
          kinds.add(problem.type);
          const answer = expectedProblemAnswer(problem);
          expect(problemIsCorrect(problem, answer), lesson.slug).toBe(true);
          expect(problemIsCorrect(problem, answer.map(() => "intentionally-wrong")), lesson.slug).toBe(false);
          expect(problem.explanation.length).toBeGreaterThan(20);
          validateReferences(problem);
        }
      }
    }
    expect([...kinds].sort()).toEqual(["diagram", "fill", "pairs", "sequence", "sort", "word-search"]);
  });
});

function validateReferences(problem: Problem) {
  switch (problem.type) {
    case "word-search":
      expect(problem.grid).toHaveLength(9);
      for (const word of problem.words) {
        let found = false;
        for (let start = 0; start < 81; start++) {
          for (let end = 0; end < 81; end++) {
            if (wordAtPath(problem.grid, wordSearchPath(problem.grid, start, end)) === word.text) found = true;
          }
        }
        expect(found, word.text).toBe(true);
      }
      break;
    case "pairs":
      expect(problem.left).toHaveLength(problem.right.length);
      for (const id of problem.matches) expect(problem.right.some((item) => item.id === id)).toBe(true);
      break;
    case "sequence":
      expect([...problem.order].sort()).toEqual(problem.items.map((item) => item.id).sort());
      break;
    case "sort":
      for (const item of problem.items) expect(problem.categories.some((category) => category.id === item.categoryId)).toBe(true);
      break;
    case "diagram":
      expect(problem.image).toMatch(/^\/images\/curriculum-science\//);
      expect(existsSync(path.join(process.cwd(), "public", problem.image))).toBe(true);
      for (const target of problem.targets) {
        expect(problem.labels.some((label) => label.id === target.labelId)).toBe(true);
        expect(target.x).toBeGreaterThanOrEqual(0);
        expect(target.x).toBeLessThanOrEqual(100);
        expect(target.y).toBeGreaterThanOrEqual(0);
        expect(target.y).toBeLessThanOrEqual(100);
      }
      break;
  }
}
