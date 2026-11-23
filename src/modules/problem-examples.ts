import type { Problem } from "./problems";

export const problemExamples: readonly Problem[] = [
  { id: "animal-search", type: "word-search", prompt: "Find CAT, DOG and PIG. Select the first and last letter of each word.", explanation: "Words can run across, down or diagonally, in either direction.",
    grid: ["CATXM", "DBZNL", "OUPQR", "GKXIV", "HJAWG"], words: [{ id: "cat", text: "CAT" }, { id: "dog", text: "DOG" }, { id: "pig", text: "PIG" }] },
  { id: "french-pictures", type: "picture-match", prompt: "Match each French word to its picture.", explanation: "Un chat is a cat, un chien is a dog, and un lapin is a rabbit.",
    words: [{ id: "dog", text: "un chien" }, { id: "rabbit", text: "un lapin" }, { id: "cat", text: "un chat" }],
    pictures: [{ id: "cat-picture", pictureId: "cat", description: "Cat", wordId: "cat" }, { id: "dog-picture", pictureId: "dog", description: "Dog", wordId: "dog" }, { id: "rabbit-picture", pictureId: "rabbit", description: "Rabbit", wordId: "rabbit" }] },
  { id: "feeding-sort", type: "sort", prompt: "Sort these organisms into producers and consumers.", explanation: "Plants make food using light. Rabbits and foxes obtain energy by eating other organisms.",
    categories: [{ id: "producer", text: "Producer" }, { id: "consumer", text: "Consumer" }],
    items: [{ id: "rabbit", text: "Rabbit", categoryId: "consumer" }, { id: "grass", text: "Grass", categoryId: "producer" }, { id: "fox", text: "Fox", categoryId: "consumer" }, { id: "tree", text: "Oak tree", categoryId: "producer" }] },
  { id: "story-sequence", type: "sequence", prompt: "Put Maya's seed story in order, from first to last.", explanation: "Maya plants the seed, checks the pot while she waits, sees a shoot, and shares the news.",
    items: [{ id: "share", text: "Maya runs to get her brother." }, { id: "plant", text: "Maya plants a seed." }, { id: "shoot", text: "A green shoot appears." }, { id: "wait", text: "Maya checks the pot each morning." }],
    order: ["plant", "wait", "shoot", "share"] },
  { id: "fraction-pairs", type: "pairs", prompt: "Match each fraction with an equivalent fraction.", explanation: "Multiply the numerator and denominator by the same nonzero number to keep the value.",
    left: [{ id: "half", text: "1/2" }, { id: "third", text: "1/3" }, { id: "three-quarters", text: "3/4" }],
    right: [{ id: "two-sixths", text: "2/6" }, { id: "six-eighths", text: "6/8" }, { id: "two-fourths", text: "2/4" }], matches: ["two-fourths", "two-sixths", "six-eighths"] },
  { id: "plant-labels", type: "diagram", prompt: "Label the numbered parts of this plant.", explanation: "Leaves collect light, the stem supports the plant, and roots take in water from the soil.",
    image: "/images/plant-parts.svg", description: "Plant with leaves above the ground, a central stem, and branching roots below the ground.",
    labels: [{ id: "roots", text: "Roots" }, { id: "leaves", text: "Leaves" }, { id: "stem", text: "Stem" }],
    targets: [{ id: "leaf", x: 74, y: 23, labelId: "leaves" }, { id: "stem", x: 50, y: 48, labelId: "stem" }, { id: "roots", x: 60, y: 84, labelId: "roots" }] },
  { id: "fraction-blank", type: "fill", prompt: "Complete the fraction sentence.", before: "2/7 + 3/7 =", after: ".", accepted: ["5/7"], explanation: "Two sevenths plus three sevenths is five sevenths. The denominator stays 7." },
  { id: "spelling-spot", type: "spelling-highlight", prompt: "Highlight every misspelled word in this sentence.", tokens: ["The", "paitent", "child", "finished", "the", "assigment", "."], incorrect: [1, 5], explanation: "The correct spellings are patient and assignment." },
];

export const immersionProblems: readonly Problem[] = [
  { id: "french-instructions", type: "sequence", prompt: "Place les consignes dans l'ordre.", explanation: "D'abord vient au début, ensuite au milieu et enfin à la fin.",
    items: [{ id: "write", text: "Enfin, écris ton prénom." }, { id: "paper", text: "D'abord, prends une feuille." }, { id: "draw", text: "Ensuite, dessine un soleil." }], order: ["paper", "draw", "write"] },
  { id: "french-blank", type: "fill", prompt: "Complète la phrase pour demander de l'aide.", before: "Peux-tu", after: ", s'il te plaît ?", accepted: ["répéter"], explanation: "« Peux-tu répéter, s'il te plaît ? » est une demande polie. L'accent fait partie du mot." },
];
