import type { SubjectModule } from "./types";

export const reading: SubjectModule = {
  slug: "reading",
  title: "Language & Reading",
  theme: "reading",
  tagline: "Every story opens a door.",
  description: "Listen, speak, read, write, build vocabulary and spelling, and think critically about stories and media.",
  lessons: [{
    slug: "read-between-the-lines",
    title: "Read between the lines",
    durationMinutes: 10,
    introduction: "Authors don't always tell us everything. Good readers combine clues in a story with what they already know. That's called making an inference.",
    sections: [
      { heading: "A tiny story with big clues", body: "Maya held the seed packet tightly. Every morning she checked the pot on the windowsill. For days, nothing changed. On Friday, a tiny green shoot appeared. Maya ran to get her brother, grinning." },
      { heading: "Use evidence, not just a guess", body: "The story never says Maya is excited, but her grin and her rush to get her brother are clues. We know people often smile and share news when they're excited. Those clues support our inference about her feelings." },
      { heading: "Find the main idea", body: "The main idea is what a passage is mostly about. Here, Maya patiently cares about a seed and celebrates when it sprouts. The windowsill and Friday are details; the experience of waiting for growth is the bigger idea." },
    ],
    questions: [
      { id: "feeling", prompt: "How does Maya most likely feel when the shoot appears?", options: ["Excited", "Angry", "Bored"], answerIndex: 0, explanation: "Maya grins and runs to share the news. Those actions suggest excitement." },
      { id: "evidence", prompt: "Which detail best shows that Maya cares about the seed growing?", options: ["The pot is on a windowsill", "She checks the pot every morning", "The shoot appears on Friday"], answerIndex: 1, explanation: "Checking every morning shows Maya is interested in the seed's progress." },
      { id: "main-idea", prompt: "Which is the best summary of the story?", options: ["Maya buys a new windowsill", "Maya and her brother forget a plant", "Maya waits for a seed to grow and celebrates when it sprouts"], answerIndex: 2, explanation: "A summary includes the most important events, not just a small detail." },
    ],
  }],
};
