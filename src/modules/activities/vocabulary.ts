import { highlight, pairs } from "./builders";
import type { Problem } from "../problems";
import { spellingLists } from "../spelling";

const spellingPractice: Readonly<Record<string, Problem>> = {
  "test-1": highlight("Highlight the misspelled Lesson 1 words.", ["The", "obediant", "child", "finished", "the", "assigment", "."], [1, 5], "The correct spellings are obedient and assignment."),
  "test-2": highlight("Highlight the misspelled Lesson 2 words.", ["We", "will", "cultivat", "plants", "in", "a", "tropcal", "garden", "."], [2, 6], "The correct spellings are cultivate and tropical."),
  "test-3": highlight("Highlight the misspelled Lesson 3 words.", ["The", "carnivorus", "animal", "can", "surviev", "."], [1, 4], "The correct spellings are carnivorous and survive."),
};

export const vocabularyPractice: Readonly<Record<string, readonly Problem[]>> = Object.fromEntries(spellingLists.map((list, index) => [
  list.id, [
    pairs(`Match all Lesson ${index + 1} words to their meanings.`, list.words.map((word) => {
      const definition = list.vocabulary.find((entry) => entry.id === word);
      if (!definition) throw new Error(`Vocabulary meaning is missing for ${list.id}: ${word}`);
      return [word, definition.options[definition.answerIndex]] as const;
    }), "Use the definitions and example sentences in the study list to check every match."),
    ...(spellingPractice[list.id] ? [spellingPractice[list.id]] : []),
  ],
]));
