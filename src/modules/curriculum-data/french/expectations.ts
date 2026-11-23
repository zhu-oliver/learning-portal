const official = "https://www.edu.gov.on.ca/eng/curriculum/elementary/fsl18-2013curr.pdf";

// Printed pagination is two pages behind the PDF viewer pagination.
export const frenchSources = {
  core: { 5: 69, 6: 83, 7: 97, 8: 111 },
  immersion: { 1: 203, 3: 231, 4: 245, 5: 259, 6: 273, 7: 287, 8: 301 },
} as const;

export const culturalScope = {
  core: { 5: "Quebec", 6: "eastern, western, and northern Canada", 7: "the Americas outside Canada", 8: "Europe" },
  immersion: { 1: "les communautés francophones locales", 3: "les communautés francophones locales et de l'Ontario", 4: "l'Ontario", 5: "le Québec", 6: "l'est, l'ouest et le nord du Canada", 7: "les Amériques hors du Canada", 8: "la France" },
} as const;

export function sourceFor(program: "core" | "immersion", grade: number): string {
  const pages: Readonly<Partial<Record<number, number>>> = frenchSources[program];
  if (!pages[grade]) throw new Error(`Unsupported French program/grade: ${program}/${grade}`);
  return `${official}#page=${pages[grade]}`;
}

// These are original summaries, not quotations of curriculum expectations.
const common: readonly (readonly [string, string])[] = [
  ["A1.1", "Select and assess strategies before, during, and after listening."],
  ["A2.1", "Use listening behaviours and clarification suited to an exchange."],
  ["A2.2", "Show understanding through relevant responses to another speaker."],
  ["A2.3", "Discuss listening strengths, obstacles, useful strategies, and next steps."],
  ["B1.1", "Prepare and use oral communication strategies for purpose and audience."],
  ["B1.2", "Communicate an organized oral message using suitable French."],
  ["B1.3", "Speak understandably with appropriate pace, expression, and pronunciation."],
  ["B2.1", "Use respectful, effective speaking behaviours during interaction."],
  ["B2.2", "Participate meaningfully in rehearsed and spontaneous exchanges."],
  ["B2.3", "Reflect on speaking strategies and set an observable improvement goal."],
  ["C1.1", "Choose and evaluate strategies that support reading comprehension."],
  ["C1.2", "Explain a text's meaning using details and defensible inferences."],
  ["C1.3", "Read accurately and expressively in meaningful phrases."],
  ["C1.4", "Develop and verify vocabulary through contextual clues and resources."],
  ["C2.1", "Relate the purposes of different text forms to their readers."],
  ["C2.2", "Explain how text features and stylistic choices support a form's purpose."],
  ["C2.3", "Reflect on reading strategies, strengths, difficulties, and next steps."],
  ["D1.1", "Choose a writing purpose and intended audience before composing."],
  ["D1.2", "Compose French texts in different forms suited to a communicative purpose."],
  ["D2.1", "Generate, select, develop, and organize ideas using planning resources."],
  ["D2.2", "Draft and revise content, clarity, and interest using models and feedback."],
  ["D2.3", "Edit, proofread, and present readable finished work using agreed criteria."],
  ["D2.4", "Explain writing strategies and changes, then identify a next learning goal."],
];

export function expectationInventory(program: "core" | "immersion", grade: number): readonly (readonly [string, string])[] {
  sourceFor(program, grade);
  const immersion = program === "immersion";
  const scope = immersion
    ? culturalScope.immersion[grade as keyof typeof culturalScope.immersion]
    : culturalScope.core[grade as keyof typeof culturalScope.core];
  const complexity = grade <= 3 ? "familiar everyday" : grade <= 6 ? "familiar, academic, and personally relevant" : "increasingly complex academic and personally relevant";
  const entries: (readonly [string, string])[] = [
    ...common,
    ["A1.2", immersion ? `Explain why one listens in ${grade <= 3 ? "a few familiar" : "varied"} situations.` : `Understand the purpose and message of ${complexity} oral French with contextual support.`],
    ...(["A", "B", "C", "D"] as const).flatMap((strand): (readonly [string, string])[] => [
      [`${strand}3.1`, `${{ A: "Listen to", B: "Present orally from", C: "Read", D: "Write using" }[strand]} contextualized community resources about ${scope}; locate communities and make respectful, specific cultural connections.`],
      [`${strand}3.2`, `${{ A: "Recognize in listening", B: "Use when speaking", C: "Recognize in reading", D: "Use when writing" }[strand]} social language conventions appropriate to audience, community, and situation.`],
    ]),
  ];
  if (immersion) {
    entries.push(
      ["A1.3", `Interpret ${complexity} oral messages, supporting meaning with heard evidence.`],
      ["A1.4", `Respond to and evaluate how spoken media present a message to an audience${grade <= 3 ? ", with adult support" : ""}.`],
      ["B1.4", "Create oral media using form, sound, and presentation choices suited to purpose and audience."],
      ["C1.5", `Evaluate messages and presentation choices in written and visual media${grade <= 3 ? ", with guided personal responses" : ""}.`],
      ["D1.3", "Verify meanings and refine or vary word choices using suitable vocabulary resources."],
      ["D1.4", `${grade <= 3 ? "Begin, with support, to develop" : "Use language and stylistic choices to establish"} a personal voice and clear viewpoint.`],
      ["D1.5", "Create French media texts using conventions and techniques suited to a particular audience and purpose."],
    );
    if (grade >= 4) entries.push(["D1.6", "Apply French spelling, sentence order, punctuation, and grammatical conventions to clarify meaning."]);
  } else if (grade >= 7) {
    entries.push(["D1.3", "Apply French spelling, sentence order, punctuation, and grammatical conventions to clarify meaning."]);
  }
  return entries.sort(([a], [b]) => a.localeCompare(b));
}
