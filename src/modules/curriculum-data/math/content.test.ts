import { describe, expect, it } from "vitest";
import { mathGradeContent, mathSpecificExpectations, mathResearchSources } from "../math";
import { expectedProblemAnswer, problemIsCorrect } from "../../problems";

// Independently fetched ministry l5___specific_expectation ranges, NOT lesson-derived.
// Course API depth=5, verified 2026-10-11. A1 is l4___overall_expectation.
const official: Record<number, readonly number[]> = {
  1: [38, 8, 5, 4, 3, 2, 5, 2, 5, 3, 1],
  2: [39, 7, 6, 4, 3, 2, 5, 2, 5, 4, 1],
  3: [46, 7, 9, 4, 3, 2, 5, 2, 4, 9, 1],
  5: [51, 7, 9, 4, 4, 2, 6, 2, 5, 6, 6],
  6: [51, 6, 12, 4, 4, 2, 6, 2, 4, 6, 5],
  7: [52, 7, 10, 4, 4, 2, 6, 2, 4, 7, 6],
  8: [44, 4, 8, 4, 4, 2, 6, 2, 4, 4, 6],
};
const prefixes = ["B1", "B2", "C1", "C2", "C3", "D1", "D2", "E1", "E2", "F1"];

// Independent numerical and conceptual answers exercise each grade's actual scope.
const oracles: readonly (readonly [number, string, string])[] = [
  [1, "How many counters are three tens and six ones?", "36"],
  [1, "Five sandwiches shared fairly by two gives each...", "Two and a half sandwiches"],
  [1, "Four half-circles make how many wholes?", "2 wholes"],
  [1, "What does the equals sign mean?", "Both sides have the same value"],
  [1, "Two 25-cent coins have the same value as...", "One 50-cent coin"],
  [2, "Thirteen tens and two ones equal...", "132"],
  [2, "Seven pizzas shared by three gives each...", "2 and 1/3 pizzas"],
  [2, "46 + 27 equals...", "73"],
  [2, "A ribbon from 3 cm to 11 cm is...", "8 cm long"],
  [2, "What are the modes of 1, 1, 4, 4, 5?", "1 and 4"],
  [3, "Fourteen pizzas shared by eight gives each...", "1 and 3/4 pizzas"],
  [3, "367 + 258 equals...", "625"],
  [3, "The mean of 3, 5, 7 is...", "5"],
  [3, "One minute fifteen seconds equals...", "75 seconds"],
  [3, "Change from 80¢ for a 45¢ cost is...", "35¢"],
  [5, "24 × 13 equals...", "312"],
  [5, "384 ÷ 16 equals...", "24"],
  [5, "3 ÷ 1/4 equals...", "12"],
  [5, "A triangle with base 10 and height 6 has area...", "30 cm²"],
  [5, "On a $20 subtotal at 13%, tax is...", "$2.60"],
  [6, "Which is a prime factorization of 60?", "2 × 2 × 3 × 5"],
  [6, "246 × 0.3 equals...", "73.8"],
  [6, "126 ÷ 0.6 equals...", "210"],
  [6, "4.536 ÷ 6 equals...", "0.756"],
  [6, "Surface area of a 4×3×2 prism is...", "52 cm²"],
  [7, "The least common multiple of 4,6,9 is...", "36"],
  [7, "2/3 ÷ 4/5 equals...", "5/6"],
  [7, "Both red without replacement from 3 red and 2 blue has probability...", "3/10"],
  [7, "A semicircle of radius 4 has boundary length...", "4π + 8 cm"],
  [7, "Surface area of radius-2 height-5 cylinder is...", "28π cm²"],
  [8, "0.00056 in scientific notation is...", "5.6 × 10⁻⁴"],
  [8, "2 1/2 ÷ 3/4 equals...", "3 1/3"],
  [8, "(−3)(−4) − 2(−5) equals...", "22"],
  [8, "All red in three no-replacement draws from 4 red,2 blue is...", "1/5"],
  [8, "Two described joined prisms have surface area...", "92 cm²"],
  [8, "Compound balance after two years from $1000 at 5% is...", "$1102.50"],
];

const anchorChecks: Record<number, readonly (readonly [string, RegExp])[]> = {
  1: [["B1.1", /36|thirty-six/], ["B1.8", /ten.*smaller|smaller.*ten/], ["F1.1", /fifty-cent|fifty-dollar/]],
  2: [["B1.4", /twenty-five|twenty-counting/], ["C3.1", /concurrent/], ["D1.1", /Venn[\s\S]*Carroll|Carroll[\s\S]*Venn/]],
  3: [["B2.2", /five.*ten|ten.*five/], ["B2.9", /one to five|one to ten/], ["E2.9", /square-centimetre|square centimetres/]],
  5: [["B1.1", /100,000|one hundred thousand/], ["B2.7", /384[\s\S]*16|389[\s\S]*sixteen/], ["F1.6", /municipal[\s\S]*tax|tax[\s\S]*municipal/i]],
  6: [["B2.6", /factor tree/], ["D1.3", /histogram/i], ["E2.6", /pyramid[\s\S]*surface|surface[\s\S]*pyramid/]],
  7: [["B1.1", /billion/], ["C3.1", /subprogram/], ["D2.2", /replacement/]],
  8: [["B1.2", /irrational/i], ["B2.7", /negative[\s\S]*negative/], ["E2.4", /hypotenuse/], ["F1.4", /spreadsheet[\s\S]*1\.05/]],
};

function numericalValue(text: string): number | undefined {
  const original = text.trim().replace(/[−–]/g, "-").replace(/×/g, "*").replace(/÷/g, "/");
  if (!/^[\d\s.()+*/^−-]+$/.test(original)) return undefined;
  // Protect literal fractions before interpreting division operators.
  const normalized = original
    .replace(/(\d+)\s+(\d+)\/(\d+)/g, "($1+$2/$3)")
    .replace(/(?<![.\d])(\d+)\/(\d+)(?![.\d])/g, "($1/$2)")
    .replace(/(\d)\s*\(/g, "$1*(");
  const tokens = normalized.match(/\d+(?:\.\d+)?|[()+*/^-]/g);
  if (!tokens) return undefined;
  let index = 0;
  function primary(): number {
    if (tokens![index] === "-") { index++; return -primary(); }
    if (tokens![index] === "+") { index++; return primary(); }
    if (tokens![index] === "(") {
      index++;
      const value = sum();
      if (tokens![index++] !== ")") throw new Error("Unbalanced arithmetic");
      return value;
    }
    const token = tokens![index++];
    if (!token || !/^\d/.test(token)) throw new Error("Missing number");
    return Number(token);
  }
  function product(): number {
    let value = primary();
    while (tokens![index] === "*" || tokens![index] === "/") {
      const operation = tokens![index++];
      const right = primary();
      value = operation === "*" ? value * right : value / right;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (tokens![index] === "+" || tokens![index] === "-") {
      const operation = tokens![index++];
      const right = product();
      value = operation === "+" ? value + right : value - right;
    }
    return value;
  }
  try {
    const value = sum();
    return index === tokens.length && Number.isFinite(value) ? value : undefined;
  } catch { return undefined; }
}

describe("independently verified Ontario 2020 math data", () => {
  it("matches the ministry's complete per-grade numbered enumeration", () => {
    expect(Object.keys(mathGradeContent).map(Number)).toEqual([1, 2, 3, 5, 6, 7, 8]);
    for (const [gradeText, [count, ...ranges]] of Object.entries(official)) {
      const grade = Number(gradeText);
      const content = mathGradeContent[grade]!;
      const expectedIds = prefixes.flatMap((prefix, index) =>
        Array.from({ length: ranges[index] }, (_, n) => `${prefix}.${n + 1}`));
      expect(content.expectations.map(([id]) => id).sort()).toEqual(expectedIds.sort());
      expect(content.expectations).toHaveLength(count);
      expect(content.expectations).toBe(mathSpecificExpectations[grade as keyof typeof mathSpecificExpectations]);
      expect(content.processes?.map(([id]) => id)).toEqual(["A1", "C4"]);
      expect(content.edition).toBe(2020);
      expect(content.source).toBe(`https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g${grade}-math/strands`);
    }
    expect(mathResearchSources.courseApi).toContain("ws.api.dcp.edu.gov.on.ca");
  });

  it("has substantial complete lessons, unique assessments, and mapped coverage", () => {
    const slugs = new Set<string>();
    for (const [gradeText, content] of Object.entries(mathGradeContent)) {
      const grade = Number(gradeText);
      const declared = new Set([...content!.expectations, ...content!.processes!].map(([id]) => id));
      const mapped = new Set<string>();
      const sectionMapped = new Set<string>();
      expect(content!.lessons.length).toBeGreaterThanOrEqual(16);
      for (const lesson of content!.lessons) {
        expect(lesson.slug).toMatch(new RegExp(`^g${grade}-[a-z0-9-]+$`));
        expect(lesson.slug.length).toBeLessThanOrEqual(80);
        expect(slugs.has(lesson.slug), lesson.slug).toBe(false);
        slugs.add(lesson.slug);
        expect(lesson.grade).toBe(grade);
        expect(lesson.source).toBe(content!.source);
        expect(lesson.unitTitle).toBeTruthy();
        expect(lesson.unitSlug).toBeTruthy();
        expect(lesson.strand).toMatch(/^[B-F]$/);
        expect(lesson.sections, lesson.slug).toHaveLength(3);
        expect.soft(lesson.sections.reduce((n, section) => n + section.body.length, 0), lesson.slug).toBeGreaterThan(1500);
        for (const section of lesson.sections) {
          expect.soft(section.expectations!.length, `${lesson.slug}: ${section.heading}`).toBeGreaterThan(0);
          expect(section.body.length, `${lesson.slug}: ${section.heading}`).toBeGreaterThan(250);
          expect(section.activity!.length).toBeGreaterThan(100);
          expect(section.questions!.length).toBeGreaterThanOrEqual(1);
          for (const id of section.expectations!) {
            expect(declared.has(id), `${lesson.slug}: ${id}`).toBe(true);
            mapped.add(id);
            sectionMapped.add(id);
          }
        }
        for (const id of lesson.expectations!) {
          expect(declared.has(id)).toBe(true);
          mapped.add(id);
        }
        expect(lesson.questions).toHaveLength(4);
        expect(lesson.questions.map((q) => q.sectionIndex)).toEqual([0, 0, 1, 2]);
        const questions = [...lesson.sections.flatMap((s) => s.questions!), ...lesson.questions];
        expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
        expect(new Set(questions.map((q) => q.prompt)).size, lesson.slug).toBe(questions.length);
        for (const q of questions) {
          expect(q.answerIndex).toBeGreaterThanOrEqual(0);
          expect(q.answerIndex).toBeLessThan(q.options.length);
          expect(new Set(q.options).size, q.prompt).toBe(q.options.length);
          expect(q.explanation.length, q.prompt).toBeGreaterThan(20);
        }
        const activities = content!.activities[lesson.slug];
        expect(activities).toHaveLength(3);
        for (const activity of activities) {
          expect(problemIsCorrect(activity, expectedProblemAnswer(activity)), lesson.slug).toBe(true);
          expect(activity.explanation.length).toBeGreaterThan(20);
          if (activity.type === "pairs") {
            expect(new Set(activity.right.map((item) => item.text)).size).toBe(activity.right.length);
          }
        }
      }
      expect([...mapped].sort()).toEqual([...declared].sort());
      expect([...sectionMapped].sort()).toEqual([...declared].sort());
      for (const [id, anchor] of anchorChecks[grade]) {
        const bodies = content!.lessons.filter((l) => l.expectations!.includes(id))
          .flatMap((l) => l.sections.filter((s) => s.expectations!.includes(id)).map((s) => s.body)).join("\n");
        expect(bodies, `${grade}: ${id} semantic anchor`).toMatch(anchor);
      }
    }
  });

  it("checks independent contextual, numerical, geometric, and financial answers", () => {
    for (const [grade, prompt, answer] of oracles) {
      const questions = mathGradeContent[grade]!.lessons.flatMap((lesson) =>
        [...lesson.questions, ...lesson.sections.flatMap((s) => s.questions!)]);
      const matching = questions.filter((q) => q.prompt === prompt);
      expect(matching.length, `missing oracle: ${grade} ${prompt}`).toBeGreaterThan(0);
      for (const question of matching) expect(question.options[question.answerIndex], prompt).toBe(answer);
    }
  });

  it("independently recomputes all directly stated arithmetic checks", () => {
    let verified = 0;
    for (const content of Object.values(mathGradeContent)) {
      for (const lesson of content!.lessons) {
        for (const question of [...lesson.questions, ...lesson.sections.flatMap((s) => s.questions!)]) {
          const statement = question.prompt.replace(/^(?:What is |Evaluate )/, "").replace(/(?: equals\.\.\.|\?|\.)$/, "");
          if (!/[+×÷−]/.test(statement)) continue;
          const expected = numericalValue(statement);
          if (expected === undefined) continue;
          const answer = numericalValue(question.options[question.answerIndex]);
          if (answer === undefined) continue;
          expect(answer, `${lesson.slug}: ${question.prompt}`).toBeCloseTo(expected, 8);
          const optionValues = question.options.map(numericalValue);
          expect(optionValues.filter((value) => value !== undefined && Math.abs(value - expected) < 1e-8)).toHaveLength(1);
          verified++;
        }
      }
    }
    expect(verified).toBeGreaterThan(80);
    if (process.env.MATH_AUDIT_SUMMARY) console.info(`Independently recomputed ${verified} arithmetic answers; ${oracles.length} additional contextual oracles checked.`);
  });

  it("accepts explicit numeric presentation variants without erasing required units", () => {
    const activity = (grade: number, topic: string) => mathGradeContent[grade]!.activities[`g${grade}-math-${topic}`][1];
    const interest = activity(8, "interest");
    expect(interest.type).toBe("fill");
    if (interest.type !== "fill") throw new Error("Interest must allow a typed amount");
    expect(interest.before).toContain("in dollars");
    expect(interest.before).not.toContain("Choose the complete answer");
    for (const answer of ["242", "$242", "242.00", "$242.00"]) {
      expect(problemIsCorrect(interest, [answer]), answer).toBe(true);
    }
    for (const answer of ["24.2", "$240", "242 cents", "242%"]) {
      expect(problemIsCorrect(interest, [answer]), answer).toBe(false);
    }
    for (const content of Object.values(mathGradeContent)) {
      for (const activities of Object.values(content!.activities)) {
        for (const problem of activities) {
          if (problem.type !== "fill") continue;
          expect(problem.before).not.toContain("Choose the complete answer");
          if (/^\$\d/.test(problem.accepted[0])) {
            expect(problemIsCorrect(problem, [problem.accepted[0].slice(1)])).toBe(true);
          }
        }
      }
    }
    const grams = activity(5, "measurement");
    for (const answer of ["2500", "2,500", "2500 g", "2,500g"]) {
      expect(problemIsCorrect(grams, [answer]), answer).toBe(true);
    }
    for (const answer of ["2.5", "2.5 kg", "2500 kg"]) {
      expect(problemIsCorrect(grams, [answer]), answer).toBe(false);
    }
    const area = activity(5, "area");
    for (const answer of ["20", "20 cm²", "20cm²", "20 cm^2", "20 square centimetres"]) {
      expect(problemIsCorrect(area, [answer]), answer).toBe(true);
    }
    for (const answer of ["20 cm", "20 m²", "2000"]) {
      expect(problemIsCorrect(area, [answer]), answer).toBe(false);
    }
    const cents = activity(3, "money");
    expect(problemIsCorrect(cents, ["35"])).toBe(true);
    expect(problemIsCorrect(cents, ["35¢"])).toBe(true);
    expect(problemIsCorrect(cents, ["$35"])).toBe(false);
    expect(problemIsCorrect(cents, ["0.35"])).toBe(false);
  });

  it("accepts expressly supported fractional, coordinate, and equation notation", () => {
    const activity = (grade: number, topic: string) => mathGradeContent[grade]!.activities[`g${grade}-math-${topic}`][1];
    const equivalent = activity(3, "fractions");
    for (const answer of ["4/10", "2/5", "2 / 5"]) expect(problemIsCorrect(equivalent, [answer]), answer).toBe(true);
    expect(problemIsCorrect(equivalent, ["4/5"])).toBe(false);
    expect(problemIsCorrect(equivalent, ["0.4"])).toBe(false); // This exercise requests a fraction.
    const mixed = activity(5, "proportional");
    for (const answer of ["5/3", "1 2/3", "1 and 2/3"]) expect(problemIsCorrect(mixed, [answer]), answer).toBe(true);
    expect(problemIsCorrect(mixed, ["1.67"])).toBe(false); // An approximation is not exact.
    const probability = activity(6, "probability");
    for (const answer of ["1/4", "0.25", "25%"]) expect(problemIsCorrect(probability, [answer]), answer).toBe(true);
    expect(problemIsCorrect(probability, ["0.025"])).toBe(false);
    const pair = activity(6, "location");
    for (const answer of ["(−4,−1)", "(-4, -1)", "-4,-1"]) expect(problemIsCorrect(pair, [answer]), answer).toBe(true);
    expect(problemIsCorrect(pair, ["-1,-4"])).toBe(false);
    const equation = activity(7, "algebra");
    for (const answer of ["4", "x=4", "x = 4", "4.0"]) expect(problemIsCorrect(equation, [answer]), answer).toBe(true);
    expect(problemIsCorrect(equation, ["x=5"])).toBe(false);
  });
});
