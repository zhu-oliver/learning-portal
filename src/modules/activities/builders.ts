import type { Problem } from "../problems";

export function fill(before: string, expected: string | readonly string[], explanation: string, after = "."): Problem {
  return { id: "fill", type: "fill", prompt: "Complete the sentence.", before, after, accepted: typeof expected === "string" ? [expected] : expected, explanation };
}

export function pairs(prompt: string, entries: readonly (readonly [string, string])[], explanation: string): Problem {
  return { id: "pairs", type: "pairs", prompt, explanation,
    left: entries.map(([text], index) => ({ id: `left-${index}`, text })),
    right: entries.map(([, text], index) => ({ id: `right-${index}`, text })).reverse(),
    matches: entries.map((_, index) => `right-${index}`) };
}

export function sort(prompt: string, categories: readonly [string, string], entries: readonly (readonly [string, 0 | 1])[], explanation: string): Problem {
  return { id: "sort", type: "sort", prompt, explanation,
    categories: categories.map((text, index) => ({ id: `category-${index}`, text })),
    items: entries.map(([text, category], index) => ({ id: `item-${index}`, text, categoryId: `category-${category}` })) };
}

export function sequence(prompt: string, steps: readonly string[], explanation: string): Problem {
  const items = steps.map((text, index) => ({ id: `step-${index}`, text }));
  return { id: "sequence", type: "sequence", prompt, explanation, items: [...items.slice(1), items[0]], order: items.map((item) => item.id) };
}

export function highlight(prompt: string, tokens: readonly string[], incorrect: readonly number[], explanation: string): Problem {
  return { id: "highlight", type: "spelling-highlight", prompt, tokens, incorrect, explanation };
}

export function search(words: readonly string[], explanation: string, prompt = "Find each topic word by selecting its first and last letter."): Problem {
  if (words.length > 3 || words.some((word) => word.length > 7)) throw new Error("Topic word searches support up to three words of seven letters.");
  const grid = Array.from({ length: 9 }, (_, row) => Array.from({ length: 9 }, (_, column) => "XQZJKLMNV"[(row + column * 2) % 9]));
  words.forEach((word, index) => [...word.toLocaleUpperCase()].forEach((letter, offset) => {
    const [row, column] = index === 0 ? [0, offset] : index === 1 ? [offset + 1, 8] : [offset + 2, offset];
    grid[row][column] = letter;
  }));
  return { id: "search", type: "word-search", prompt, explanation, grid: grid.map((row) => row.join("")), words: words.map((text, index) => ({ id: `word-${index}`, text: text.toLocaleUpperCase() })) };
}

export type ActivitySet = readonly [practice: Problem, finalOne: Problem, finalTwo: Problem];
export type ActivityBank = Readonly<Record<string, ActivitySet>>;
