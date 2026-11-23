import type { SubjectModule } from "./types";

export const math: SubjectModule = {
  slug: "math",
  title: "Math",
  theme: "math",
  tagline: "Small steps. Big discoveries.",
  description: "Crack number puzzles, spot patterns, and make sense of the world.",
  lessons: [{
    slug: "fraction-detectives",
    title: "Fraction detectives",
    durationMinutes: 10,
    introduction: "A pizza, a chocolate bar, a team of friends: fractions help us describe parts of a whole. Let's investigate!",
    sections: [
      { heading: "Meet the numerator and denominator", body: "In 3/4, the bottom number (the denominator) says the whole is split into 4 equal parts. The top number (the numerator) says we have 3 of those parts. Equal parts are important: four slices of different sizes aren't fourths!" },
      { heading: "Different names, same amount", body: "One half of a pizza is the same amount as two quarters: 1/2 = 2/4. Multiply the numerator AND denominator by the same nonzero number to make an equivalent fraction. For example, 2/3 = 4/6." },
      { heading: "Add parts of the same size", body: "When the denominators match, add the numerators and keep the denominator. So 1/5 + 2/5 = 3/5. You are counting fifths, not changing their size. Try drawing five equal boxes and shading three of them." },
    ],
    questions: [
      { id: "parts", prompt: "In the fraction 3/8, what does the 8 tell you?", options: ["How many parts we have", "How many equal parts make the whole", "How many wholes we have"], answerIndex: 1, explanation: "The denominator, 8, tells us the whole is divided into 8 equal parts." },
      { id: "equivalent", prompt: "Which fraction is equivalent to 1/2?", options: ["1/4", "2/3", "3/6"], answerIndex: 2, explanation: "Multiply both numbers in 1/2 by 3: you get 3/6, the same amount." },
      { id: "addition", prompt: "What is 2/7 + 3/7?", options: ["5/7", "5/14", "6/7"], answerIndex: 0, explanation: "Two sevenths plus three sevenths is five sevenths. Keep the denominator 7." },
    ],
  }],
};
