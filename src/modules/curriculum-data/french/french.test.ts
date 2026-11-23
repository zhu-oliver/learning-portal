import { describe, expect, it } from "vitest";
import { coreFrenchGradeContent, immersionGradeContent } from "../french";
import { french } from "../../french";
import { expectedProblemAnswer, problemIsCorrect, wordAtPath, wordSearchPath } from "../../problems";
import type { GradeContent } from "../types";
import type { ImmersionLesson } from "../../french-immersion";

// Independent transcription of the specific-expectation boundaries checked in
// the ministry's FSL 2013 PDF. Numbers are the final specific item under
// A1,A2,A3,B1,B2,B3,C1,C2,C3,D1,D2,D3, not generated from lesson mappings.
// Printed pages / PDF viewer pages:
// Core 5: 67–80 / 69–82; 6: 81–94 / 83–96;
//      7: 95–108 / 97–110; 8: 109–120 / 111–122.
// Immersion 1: 201–214 / 203–216; 3: 229–242 / 231–244;
//           4: 243–256 / 245–258; 5: 257–270 / 259–272;
//           6: 271–284 / 273–286; 7: 285–298 / 287–300;
//           8: 299–312 / 301–314.
const verified = [
  ["core", 5, 32, [2, 3, 2, 3, 3, 2, 4, 3, 2, 2, 4, 2], 69, "Two circles"],
  ["core", 6, 32, [2, 3, 2, 3, 3, 2, 4, 3, 2, 2, 4, 2], 83, "Room 5"],
  ["core", 7, 33, [2, 3, 2, 3, 3, 2, 4, 3, 2, 3, 4, 2], 97, "In front of the library"],
  ["core", 8, 33, [2, 3, 2, 3, 3, 2, 4, 3, 2, 3, 4, 2], 111, "Send the plan Thursday"],
  ["immersion", 1, 39, [4, 3, 2, 4, 3, 2, 5, 3, 2, 5, 4, 2], 203, "Sous la table"],
  ["immersion", 3, 39, [4, 3, 2, 4, 3, 2, 5, 3, 2, 5, 4, 2], 231, "Rapprocher les livres"],
  ["immersion", 4, 40, [4, 3, 2, 4, 3, 2, 5, 3, 2, 6, 4, 2], 245, "Attendre l'aide de l'adulte"],
  ["immersion", 5, 40, [4, 3, 2, 4, 3, 2, 5, 3, 2, 6, 4, 2], 259, "Quand le texte est prêt"],
  ["immersion", 6, 40, [4, 3, 2, 4, 3, 2, 5, 3, 2, 6, 4, 2], 273, "Le pliage"],
  ["immersion", 7, 40, [4, 3, 2, 4, 3, 2, 5, 3, 2, 6, 4, 2], 287, "Les groupes sans retour du lecteur, sous la condition donnée"],
  ["immersion", 8, 40, [4, 3, 2, 4, 3, 2, 5, 3, 2, 6, 4, 2], 301, "Ceux qui expliquent un trajet"],
] as const;
const groups = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2", "D3"];
const content = (program: string, grade: number): GradeContent => {
  const entry = (program === "core" ? coreFrenchGradeContent : immersionGradeContent)[grade];
  if (!entry) throw new Error(`Missing ${program}/${grade}`);
  return entry;
};

describe("independently verified Ontario FSL 2013 inventories", () => {
  it.each(verified)("maps every real specific expectation for %s grade %i", (program, grade, count, limits, page) => {
    const expected = groups.flatMap((prefix, i) => Array.from({ length: limits[i] }, (_, j) => `${prefix}.${j + 1}`)).sort();
    expect(expected).toHaveLength(count);
    const entry = content(program, grade);
    expect(entry.expectations.map(([id]) => id).sort()).toEqual(expected);
    expect(entry.edition).toBe(2013);
    expect(entry.source).toBe(`https://www.edu.gov.on.ca/eng/curriculum/elementary/fsl18-2013curr.pdf#page=${page}`);
    expect(new Set(entry.lessons.flatMap((lesson) => lesson.expectations ?? []))).toEqual(new Set(expected));
    for (const [id, focus] of entry.expectations) {
      expect(focus.length).toBeGreaterThan(35);
      const sections = entry.lessons.flatMap((lesson) => lesson.sections).filter((section) => section.expectations?.includes(id));
      expect(sections.length, id).toBeGreaterThan(0);
      expect(sections.every((section) => section.body.length > 250 && (section.activity?.length ?? 0) > 100)).toBe(true);
    }
  });

  it("does not replace or fabricate Core 1–4 or Immersion 2", () => {
    expect(Object.keys(coreFrenchGradeContent)).toEqual(["5", "6", "7", "8"]);
    expect(Object.keys(immersionGradeContent)).toEqual(["1", "3", "4", "5", "6", "7", "8"]);
  });

  it("preserves the differing writing and media meanings of specific codes", () => {
    expect(content("core", 7).expectations.find(([id]) => id === "D1.3")?.[1]).toMatch(/conventions/);
    expect(content("immersion", 7).expectations.find(([id]) => id === "D1.3")?.[1]).toMatch(/word choices/);
    for (const grade of [1, 3]) expect(content("immersion", grade).expectations.some(([id]) => id === "D1.6")).toBe(false);
    for (const grade of [4, 5, 6, 7, 8]) expect(content("immersion", grade).expectations.some(([id]) => id === "D1.6")).toBe(true);
    expect(content("immersion", 8).expectations.find(([id]) => id === "A3.1")?.[1]).toContain("la France");
    expect(content("core", 8).expectations.find(([id]) => id === "A3.1")?.[1]).toContain("Europe");
  });
});

describe("French lesson depth and meaningful practice", () => {
  it("checks independently reviewed narrative and language answer keys", () => {
    const keys = [
      ["core", 5, 1, 0, "Jo"], ["core", 5, 7, 1, "Une boîte bleue"],
      ["core", 6, 1, 0, "The soil is heavy"], ["core", 6, 7, 2, "A consequence"],
      ["core", 7, 1, 0, "They were in different places"], ["core", 7, 7, 1, "Préparent"],
      ["core", 8, 1, 0, "It is shorter, not necessarily better"], ["core", 8, 7, 1, "Nous choisirons"],
      ["immersion", 1, 1, 0, "Elle attend encore"], ["immersion", 1, 7, 1, "Grand"],
      ["immersion", 3, 1, 0, "Dans la poche du manteau"], ["immersion", 3, 7, 1, "Chuchoter"],
      ["immersion", 4, 1, 0, "Une porte a claqué à cause du vent"], ["immersion", 4, 7, 3, "Des boîtes légères"],
      ["immersion", 5, 1, 0, "Présenter dans la salle"], ["immersion", 5, 7, 3, "Les affiches sont lisibles"],
      ["immersion", 6, 1, 0, "Les distances étaient différentes"], ["immersion", 6, 7, 1, "Toutefois"],
      ["immersion", 7, 1, 0, "La suite doit encore être vérifiée et l'essai n'est pas universel"], ["immersion", 7, 7, 1, "Possible"],
      ["immersion", 8, 1, 0, "Poursuivre les essais avant une conclusion générale"], ["immersion", 8, 7, 3, "Quand plusieurs références restent possibles"],
    ] as const;
    for (const [program, grade, lessonIndex, questionIndex, expected] of keys) {
      const q = content(program, grade).lessons[lessonIndex].questions[questionIndex];
      expect(q.options[q.answerIndex]).toBe(expected);
    }
  });

  it.each(verified)("checks all ten %s grade %i topic lessons", (program, grade, _count, _limits, _page, answer) => {
    const entry = content(program, grade);
    expect(entry.lessons).toHaveLength(10);
    const prefix = `${program === "core" ? "core" : "imm"}-g${grade}-`;
    for (const lesson of entry.lessons) {
      expect(lesson.slug).toMatch(new RegExp(`^${prefix}[a-z0-9-]+$`));
      expect(lesson.slug.length).toBeLessThanOrEqual(80);
      expect(lesson.grade).toBe(grade);
      expect(lesson.program).toBe(program);
      expect(lesson.unitSlug).toBeTruthy();
      expect(lesson.unitTitle).toBeTruthy();
      expect(lesson.strand).toBeTruthy();
      expect(lesson.source).toBe(entry.source);
      expect(lesson.sections).toHaveLength(3);
      expect(lesson.sections.reduce((total, section) => total + section.body.length, 0), lesson.slug).toBeGreaterThan(1500);
      expect(lesson.questions).toHaveLength(4);
      expect(lesson.questions.map((q) => q.sectionIndex)).toEqual([0, 0, 1, 2]);
      const all = [...lesson.sections.flatMap((section) => section.questions ?? []), ...lesson.questions];
      expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
      for (const section of lesson.sections) {
        expect(section.body.length).toBeGreaterThan(250);
        expect(section.activity!.length).toBeGreaterThan(100);
        expect(section.questions!.length).toBeGreaterThanOrEqual(1);
        const sectionPractice = new Set(section.questions!.map((q) => q.prompt));
        expect(lesson.questions.every((q) => !sectionPractice.has(q.prompt))).toBe(true);
      }
      if (program === "immersion") {
        for (const section of (lesson as ImmersionLesson).sections) {
          expect(section.englishHelp.length).toBeGreaterThan(100);
          expect(section.body).not.toMatch(/\b(?:purpose|stated|retellings|claim)\b/);
        }
      }
      for (const q of all) {
        expect(q.options).toHaveLength(3);
        expect(new Set(q.options).size).toBe(3);
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(3);
        expect(q.explanation.length).toBeGreaterThan(20);
      }
      const activities = entry.activities[lesson.slug];
      expect(activities).toHaveLength(3);
      expect(new Set(activities.map((a) => a.type)).size).toBe(3);
      for (const problem of activities) {
        const solution = expectedProblemAnswer(problem);
        expect(problemIsCorrect(problem, solution), `${lesson.slug}/${problem.type}`).toBe(true);
        expect(problemIsCorrect(problem, ["definitely-wrong"]), `${lesson.slug}/${problem.type}`).toBe(false);
        if (program === "immersion") expect(problem.prompt).not.toMatch(/^Complete|^Find|^Match|^Sort|^Put|^Identify/);
        if (problem.type === "word-search") {
          for (const word of problem.words) {
            const size = problem.grid[0].length;
            let found = false;
            for (let start = 0; start < size * size && !found; start++) {
              for (let end = 0; end < size * size && !found; end++) {
                const path = wordSearchPath(problem.grid, start, end);
                if (path.length === word.text.length && wordAtPath(problem.grid, path) === word.text) found = true;
              }
            }
            expect(found, `${lesson.slug}/${word.text}`).toBe(true);
          }
        }
        if (problem.type === "picture-match") {
          const wordIds = new Set(french.lessons.flatMap((l) => (l.frenchWords ?? []).map((w) => w.id)));
          for (const picture of problem.pictures) {
            expect(wordIds.has(picture.pictureId)).toBe(true);
            expect(problem.words.some((w) => w.id === picture.wordId)).toBe(true);
          }
        }
      }
    }
    const first = entry.lessons[0].questions[0];
    expect(first.options[first.answerIndex]).toBe(answer);
    expect(first.listeningText?.length).toBeGreaterThan(80);
    expect(first.prompt).not.toContain(answer);
  });

  it("maps media creation and writing voice to actual production tasks", () => {
    for (const grade of [1, 3, 4, 5, 6, 7, 8]) {
      const entry = content("immersion", grade);
      const media = entry.lessons[8];
      expect(media.sections[0].expectations).toContain("A1.4");
      expect(media.sections[1].expectations).toContain("C1.5");
      expect(media.sections[2].expectations).toEqual(expect.arrayContaining(["B1.4", "D1.5"]));
      expect(media.sections[2].activity).toMatch(/Crée|Produis/);
      const craft = entry.lessons[7];
      expect(craft.sections[0].expectations).toContain("D1.3");
      expect(craft.sections[1].expectations).toContain("D1.4");
    }
  });
});
