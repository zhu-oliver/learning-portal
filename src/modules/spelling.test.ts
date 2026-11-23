import { describe, expect, it } from "vitest";
import { getSpellingList, spellingLists } from "./spelling";

describe("predefined spelling tests", () => {
  it("offers the three requested lists in the requested word order", () => {
    expect(spellingLists.map((list) => list.id)).toEqual(["test-1", "test-2", "test-3"]);
    expect(spellingLists[0].words).toEqual([
      "assignment", "patient", "budge", "obedient", "alert", "accustom", "companion", "concept",
      "compatible", "burly", "jostle", "retirement", "distraction", "pedestrian", "obstacle",
    ]);
    expect(spellingLists[1].words).toEqual([
      "combine", "purchase", "bland", "aroma", "consume", "cluster", "equivalent", "beverage",
      "crave", "cultivate", "introduce", "brittle", "tropical", "extract", "export",
    ]);
    expect(spellingLists[2].words).toEqual([
      "carnivore", "ferocious", "gigantic", "obscure", "premature", "preserve", "puny", "prey",
      "option", "extinct", "ancestor", "comprehend", "survive", "duration", "carnivorous", "comprehension", "survivor",
    ]);
    expect(getSpellingList("test-3")).toBe(spellingLists[2]);
    expect(getSpellingList("test-4")).toBeUndefined();
  });

  it("has exactly one valid meaning question per word", () => {
    for (const list of spellingLists) {
      expect(list.vocabulary.map((question) => question.id)).toEqual(list.words);
      expect(list.examples).toHaveLength(list.words.length);
      list.examples.forEach((example, index) => {
        expect(example.toLowerCase()).toContain(list.words[index]);
        expect(example.length).toBeGreaterThan(25);
      });
      expect(new Set(list.words).size).toBe(list.words.length);
      for (const question of list.vocabulary) {
        expect(question.options).toHaveLength(3);
        expect(new Set(question.options).size).toBe(3);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
        expect(question.explanation.length).toBeGreaterThan(10);
      }
    }
  });
});
