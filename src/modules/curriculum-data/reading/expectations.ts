import type { GradeContent } from "../types";
import type { ReadingGrade } from "./model";

// Independently checked against each grade's ministry record on 2026-10-11.
// These are original paraphrases, not labels generated from the lesson mappings.
const shared: GradeContent["expectations"] = [
  ["A1.1", "Apply transferable skills when receiving and creating texts in different communication contexts."],
  ["A1.2", "Explain how transferable skills support personal voice and participation in learning."],
  ["A2.1", "Use digital rights and responsibilities to build a positive identity with appropriate permission."],
  ["A2.2", "Protect privacy and well-being while navigating online environments safely."],
  ["A2.4", "Recognize and analyze the conventions and techniques of digital and media forms."],
  ["A2.5", "Connect a text's form, message, context, audience, and creator."],
  ["A2.6", "Use digital and media tools during design to solve an authentic problem creatively."],
  ["A2.7", "Collaborate online responsibly, inclusively, respectfully, and with cultural awareness."],
  ["A3.1", "Transfer this grade's literacy knowledge to other subjects and everyday situations."],
  ["A3.2", "Explore identity and belonging through diverse, culturally relevant voices and Canadian experiences."],
  ["A3.3", "Explore themes and distinct First Nations, Métis, and Inuit identities and ways of knowing."],
  ["B1.1", "Listen attentively, respond appropriately, and ask relevant questions in varied situations."],
  ["B1.2", "Use strategies before, during, and after listening to oral and non-verbal messages."],
  ["B1.3", "Adapt speaking and interaction strategies to purpose and audience."],
  ["B1.4", "Use oral expression and non-verbal strategies to interpret and communicate meaning."],
  ["B1.5", "Communicate connected ideas using suitable vocabulary, grammar, and cohesive sentences."],
  ["C1.1", "Use language knowledge and background knowledge to understand varied texts."],
  ["C1.2", "Recognize text forms and genres and explain their distinguishing features."],
  ["C1.4", "Explain how images, graphics, and visual design help convey meaning."],
  ["C2.1", "Activate relevant knowledge from life and texts before encountering a new text."],
  ["C2.2", "Identify a reading, listening, or viewing purpose and choose an appropriate text."],
  ["C2.3", "Make and check predictions using prior knowledge, features, and textual evidence."],
  ["C2.4", "Monitor understanding and use repair strategies such as rereading and questioning."],
  ["C2.5", "Connect textual ideas with lived experiences, other texts, and the wider world."],
  ["C2.7", "Identify and reflect on strategies that improved comprehension."],
  ["C3.5", "Identify explicit and implied perspectives and explain their influence on audiences."],
  ["C3.6", "Respond to and examine messages about diversity, inclusion, and accessibility."],
  ["C3.8", "Reflect on the thinking strategies used to deepen understanding of texts."],
  ["D1.1", "Choose a topic, purpose, and intended audience before creating a text."],
  ["D1.2", "Develop ideas using experiences, resources, and learning across subjects."],
  ["D1.4", "Sort and sequence information to suit a chosen form and genre."],
  ["D1.5", "Reflect on strategies that helped develop and organize ideas."],
  ["D2.1", "Draft varied forms and genres using suitable media, tools, and strategies."],
  ["D2.3", "Develop a personal voice through words that convey thoughts, feelings, and stance."],
  ["D3.1", "Produce final texts with techniques and tools that support the intended effect."],
  ["D3.2", "Present created texts using appropriate communication strategies."],
];

const foundations: Record<ReadingGrade, GradeContent["expectations"]> = {
  1: [
    ["B2.1", "Orally isolate, blend, and segment phonemes, progressing from two sounds to more complex spoken words."],
    ["B2.2", "Name and form uppercase and lowercase letters in and out of sequence; know alphabetic order automatically."],
    ["B2.3", "Read and spell the most common consonant and vowel sound-letter correspondences automatically."],
    ["B2.4", "Blend phonemes to decode and segment to spell regular words in isolation and connected text."],
    ["B2.5", "Use emerging spelling-pattern knowledge, including letter-position tendencies, to read and spell."],
    ["B2.6", "Use common bases, prefixes, and suffixes and their meanings to read and spell words."],
    ["B2.7", "Use familiar and explicitly taught vocabulary across subjects; analyze new words with emerging morphology."],
    ["B2.8", "Read simple words, short sentences, and paragraphs accurately, at a useful pace, with expression."],
    ["B3.1", "Identify and create simple and compound statements, commands, questions, and exclamations."],
    ["B3.2", "Use singular/plural nouns, I, time-marking verbs, common adjectives, adverbs, and conjunctions."],
    ["B3.3", "Use sentence-opening capitals and suitable sentence-ending punctuation for meaning."],
  ],
  2: [
    ["B2.1", "Decode and spell regular one- and multiple-syllable words using phonics, blending, segmentation, and sound-approximation correction."],
    ["B2.2", "Use spelling patterns and letter-position tendencies to read and spell words."],
    ["B2.3", "Use developing base, prefix, and suffix knowledge to read and spell words."],
    ["B2.4", "Use taught vocabulary across contexts and analyze unfamiliar words with developing morphology."],
    ["B2.5", "Read words, sentences, and paragraphs accurately with meaningful pace, expression, and intonation."],
    ["B3.1", "Construct statements, questions, commands, exclamations, and compound sentences."],
    ["B3.2", "Use abstract/collective nouns, personal pronouns, be forms, adjective comparisons, conjunctions, and adverb modification."],
    ["B3.3", "Use proper-noun capitals, list commas, possessive apostrophes, and direct-speech quotation marks."],
  ],
  3: [
    ["B2.1", "Apply consolidated phonics to regular one- and multiple-syllable reading/spelling and correct approximate pronunciations."],
    ["B2.2", "Apply consolidated spelling-pattern knowledge, including position-based tendencies."],
    ["B2.3", "Use developing morpheme meanings to read and spell words."],
    ["B2.4", "Apply taught vocabulary across subjects and use morphology to interpret unfamiliar words."],
    ["B2.5", "Read words, complex sentences, and paragraphs fluently, adapting expression and intonation to purpose."],
    ["B3.1", "Construct simple, compound, and complex sentences with adverbial clauses."],
    ["B3.2", "Use possessive nouns, linking verbs, progressive tense, interrogative modifiers, prepositions, and interjections."],
    ["B3.3", "Capitalize dialogue and title words; mark direct speech and quotations with commas/quotation marks; use contractions."],
  ],
  5: [
    ["B2.1", "Generalize morpheme and word meanings to accurate, automatic reading and spelling."],
    ["B2.2", "Use taught vocabulary across subjects and generalized morphology to analyze unfamiliar words."],
    ["B2.3", "Read varied texts accurately and fluently, adapting aloud expression and intonation to purpose."],
    ["B3.1", "Construct varied forms including compound-complex sentences; repair fragments and run-ons."],
    ["B3.2", "Use direct-object nouns, intensive/reflexive pronouns, proper adjectives, and correlative conjunctions."],
    ["B3.3", "Set off appositives and participial phrases with commas; introduce a list after a complete sentence with a colon."],
  ],
  6: [
    ["B2.1", "Read and spell complex words automatically using generalized morpheme meanings."],
    ["B2.2", "Use taught vocabulary in varied contexts and generalized morphology to interpret new words."],
    ["B2.3", "Read varied texts accurately and fluently with purpose-sensitive expression and intonation."],
    ["B3.1", "Construct effective complex sentences using adjective/relative clauses to express relationships."],
    ["B3.2", "Recognize gerund nouns and distinguish and convert active and passive voice."],
    ["B3.3", "Use colons in formal salutations and script speaker labels, and commas after transitions."],
  ],
  7: [
    ["B2.1", "Read and spell complex words automatically by generalizing word and morpheme meanings."],
    ["B2.2", "Use a wide vocabulary flexibly across subjects and generalized morphology for new words."],
    ["B2.3", "Read complex texts accurately with useful pacing and purpose-sensitive aloud expression."],
    ["B3.1", "Combine clauses and phrases into effective complex sentences showing relationships."],
    ["B3.2", "Use indirect objects, predicate nouns/adjectives, participles, and adverbial phrases."],
    ["B3.3", "Use quotation-introducing colons, clause-separating semicolons, conjunctive-adverb commas, and meaningful ellipses/dashes."],
  ],
  8: [
    ["B2.1", "Apply consolidated morpheme knowledge to accurate, automatic complex-word reading and spelling."],
    ["B2.2", "Use a wide vocabulary flexibly and consolidated morphology to interpret new words across contexts."],
    ["B2.3", "Read complex texts fluently, accurately, and with purpose-sensitive phrasing and intonation."],
    ["B3.1", "Construct increasingly complex sentences connecting ideas accurately and effectively."],
    ["B3.2", "Refine the use of parts of speech and grammar for precise comprehension and communication."],
    ["B3.3", "Refine capitalization and punctuation choices for clear, coherent reading and writing."],
  ],
};

const textProgression: Record<ReadingGrade, readonly [string, string, string, string, string, string, string]> = {
  1: ["Recognize sequence/chronology, illustrations, symbols, and titles.", "Identify simple voice, word patterns, and sentence style.", "Identify a narrator and suggest another viewpoint.", "Identify rhyme, alliteration, and onomatopoeia and their effects.", "Identify and sequence key information in simple texts.", "Identify cultural symbols and values and their contribution to meaning.", "Find the main idea and important information in a simple text."],
  2: ["Recognize chronological/journal patterns, contents pages, charts, and icons.", "Explain simple style choices and their effects.", "Identify first/third-person narration and suggest another viewpoint.", "Identify consonance and simile and explain their effects.", "Sequence key information and compare simple text elements.", "Ask about cultural symbols, language, and values and share interpretations.", "State a simple text's main idea and sequence important details."],
  3: ["Recognize order of importance/cause-effect, headings, and indexes.", "Explain voice, word choice, repetition, and sentence structure.", "Identify first/third-person narration and suggest alternatives.", "Identify metaphor and assonance and explain their effects.", "Identify main/supporting ideas, sequence, and compare text elements.", "Investigate cultural symbols, language, and values through questions and discussion.", "Identify a main idea and sequence important details."],
  5: ["Explain persuasive cause-effect, prefaces, and glossaries.", "Analyze how style choices fit meaning, form, and genre.", "Compare advantages and limitations of first/second/third-person narration.", "Explain imagery and humour in relation to purpose and audience.", "Analyze supporting ideas, multiple plots, and cause-effect relationships.", "Investigate norms, values, artifacts, sports, and music and connect to experience.", "Summarize a main idea and ordered support to draw a supported conclusion."],
  6: ["Analyze problem-solution reports, subheadings, and pull-down menus.", "Analyze how style choices convey meaning and fit genre.", "Use evidence to explain how changing narrator changes a story.", "Explain hyperbole and idioms and their suitability.", "Evaluate information quality and relevance to form conclusions.", "Investigate values, rituals, ceremonies, architecture, art, and dance respectfully.", "Record a main idea and supporting details and draw supported conclusions."],
  7: ["Analyze expository cause-effect, bibliographies, and accessible fonts.", "Analyze style choices and their fit with purpose and genre.", "Explain with evidence the effect of an alternative narrator.", "Explain foreshadowing, allegory, and symbolism and their effects.", "Evaluate, synthesize, and sequence relevant information in complex texts.", "Investigate cultural values, rituals, ceremonies, architecture, art, and dance.", "Record important ideas and supporting details and draw supported conclusions."],
  8: ["Compare and evaluate problem-solution letters, glossaries, and infographics.", "Analyze meaning-making style choices in varied genres.", "Analyze limited, omniscient, and unreliable narration and justify alternatives.", "Analyze irony, satire, and allusion and their effects for an audience.", "Evaluate and synthesize relevant information in complex texts.", "Investigate norms, values, hierarchy, pastimes, language, and taboos as meaning-making elements.", "Summarize and synthesize important ideas in complex texts to draw effective conclusions."],
};

export function readingExpectations(grade: ReadingGrade): GradeContent["expectations"] {
  const p = textProgression[grade];
  const primary = grade <= 3;
  const research = grade === 1 ? "Gather relevant content from one source."
    : grade <= 3 ? "Gather relevant content from at least three sources."
    : grade === 5 ? "Record relevant content from multiple textual sources; check reliability with simple criteria and record creators/sources."
    : grade === 6 ? "Summarize relevant content from multiple sources, verify reliability, and record creators/sources."
    : grade === 7 ? "Synthesize varied sources, evaluate quality/bias/accuracy, verify reliability, and record creators/sources."
    : "Synthesize varied sources; evaluate currency, quality, bias, and accuracy; verify reliability and cite others' content.";
  const handwriting = grade === 1 ? "Print letters and words with appropriate formation, size, placement, and spacing."
    : grade === 2 ? "Print legibly and fluently with suitable letter formation, size, and spacing."
    : grade === 3 ? "Begin cursive writing with appropriate formation, size, placement, and spacing."
    : grade === 5 ? "Write fluent cursive, begin automatic keyboarding, and use word processing including appropriate fonts."
    : grade === 6 ? "Use fluent cursive and increasingly fluent, accurate keyboarding."
    : grade === 7 ? "Use personal fluent cursive and proficient word processing."
    : "Use personal fluent cursive and advanced word-processing skills.";
  const expectations: GradeContent["expectations"] = [...shared, ...foundations[grade],
    ["A2.3", primary ? "Gather, evaluate, and use information while considering different perspectives."
      : grade < 7 ? "Evaluate information for validity, credibility, accuracy, and perspective before using it."
      : "Research accuracy, credibility, misinformation, disinformation, and curated information while respecting legal/ethical duties."],
    ["C1.3", p[0]], ["C1.5", p[1]], ["C1.6", p[2]],
    ["C1.7", primary ? "Engage with diverse First Nations, Métis, and Inuit creators' texts to understand distinct cultures, histories, and lived experiences."
      : "Engage with diverse First Nations, Métis, and Inuit creators' texts through Indigenous Storywork, respecting distinct lived experiences."],
    ["C2.6", p[6]], ["C3.1", p[3]],
    ["C3.2", grade <= 2 ? "Make simple inferences from stated and implied ideas."
      : grade === 3 ? "Make inferences from explicit and implied information."
      : grade === 8 ? "Support interpretations of complex texts with local/global inferences and explicit/implicit evidence."
      : "Make local/global inferences with explicit/implicit evidence to extend interpretations."],
    ["C3.3", p[4]], ["C3.4", p[5]],
    ["C3.7", primary ? "Identify how Indigenous creators communicate histories and cultural experiences and relate them to present lives."
      : grade === 5 ? "Explain historical and cultural influences on Indigenous texts and their relationship to present experiences."
      : grade < 8 ? "Assess historical, cultural, and socio-political influences on Indigenous texts and contemporary experiences."
      : "Compare historical, cultural, and socio-political influences across two or more Indigenous texts and present lived experiences."],
    ["D1.3", research], ["D2.2", handwriting],
    ["D2.4", grade <= 2 ? "Identify viewpoint, including first person, in one's own texts."
      : grade === 3 ? "Identify first/third-person viewpoint in one's own texts."
      : grade < 8 ? "Identify own viewpoints and bias and explain how audiences with different perspectives may interpret a message."
      : "Evaluate explicit/implicit viewpoints and bias in one's writing, audience responses, and ways to acknowledge other perspectives."],
    ["D2.5", grade === 1 ? "Make simple capitalization, punctuation, and spelling edits."
      : grade === 2 ? "Revise with feedback, adding or deleting sentences."
      : grade === 3 ? "Replace words and add sentences to improve content and clarity using feedback."
      : "Revise content and style for clarity, focus, and coherence, selecting helpful feedback and reorganizing where appropriate."],
    ...(grade === 1 ? [] : [["D2.6", grade === 2 ? "Edit capitalization, punctuation, and spelling."
      : grade === 3 ? "Edit conventions, grammar, and style, then proofread to make corrections."
      : "Edit spelling, punctuation, grammar, format, and style, using digital editing tools critically."] as const]),
    ["D3.3", grade === 1 ? "Identify a helpful presentation strategy."
      : grade === 2 ? "Identify several helpful presentation strategies."
      : grade === 3 ? "Explain how presentation strategies helped communicate and improve."
      : grade === 5 ? "Describe useful publication/presentation tools and suggest improvements."
      : grade < 8 ? "Compare communication tools/strategies, reflect on topics, and plan improvements."
      : "Evaluate publishing/presenting strategies, reflect on each creative stage and topics addressed, and plan improvements."],
  ];
  const updates: Record<string, string> = {
    "D2.1": grade === 1 ? "Draft short, simple personal narratives, persuasive texts, and procedures with appropriate media and tools."
      : grade === 2 ? "Draft short personal narratives, persuasive texts, and procedures using varied tools."
      : grade === 3 ? "Draft short narrative, persuasive, and informational texts using suitable media and strategies."
      : grade === 5 ? "Draft narrative, persuasive, and informational forms with suitable media and strategies."
      : grade < 8 ? "Draft complex narrative, expository, and informational texts using varied media and strategies."
      : "Draft complex narrative, persuasive, expository, and informational texts, citing sources and transforming information.",
  };
  if (grade >= 5) {
    updates["A1.2"] = grade < 7 ? "Explain how transferable skills support voice and engagement; plan next steps to develop capabilities."
      : "Evaluate how transferable skills support voice and engagement; implement a plan to develop capabilities.";
    updates["A2.5"] = grade < 7 ? "Connect form, message, context, intended audience, and production purpose."
      : "Connect form, message, context, intended and unintended audiences, and production purpose.";
    updates["A3.2"] = grade < 7 ? "Explore identity and belonging through diverse Canadian voices, historical contexts, contributions, and lived experiences."
      : "Analyze identity and belonging through diverse Canadian voices, historical contexts, contributions, and lived experiences.";
    updates["B1.1"] = grade === 5 ? "Listen with interest, encourage elaboration through questions, and respond to others in discussions."
      : grade < 8 ? "Analyze and use listening strategies, relevant question timing, and responses to others in discussions."
      : "Evaluate listening skills including paraphrasing, open-ended questions, relevant responses, and reflection.";
    updates["B1.4"] = grade === 5 ? "Use oral/non-verbal strategies and explain how they communicate meaning."
      : grade < 8 ? "Analyze oral/non-verbal strategies and how their effectiveness may vary across cultures."
      : "Evaluate and compare oral/non-verbal strategies and their effectiveness across cultural contexts.";
    updates["C1.2"] = grade === 5 ? "Describe text-form and genre characteristics, including cultural forms, and explain their effects."
      : grade < 8 ? "Analyze text-form and genre characteristics, including cultural forms, and explain how they convey meaning."
      : "Analyze and compare text forms and genres, including cultural forms, and support their meaning-making effects with evidence.";
    updates["C2.7"] = grade === 5 ? "Explain how comprehension strategies helped with varied texts."
      : "Compare effective comprehension strategies and set improvement goals.";
    updates["C3.8"] = grade === 5 ? "Identify critical-thinking skills and explain how they supported analysis and understanding."
      : grade < 8 ? "Compare critical-thinking skills and explain which most effectively supported understanding."
      : "Assess critical-thinking effectiveness in text analysis and evaluation and set improvement goals.";
  }
  if (grade === 8) {
    updates["C3.5"] = "Analyze stated/implied perspectives, evaluate evidence of bias, and propose ways to avoid it.";
    updates["D1.1"] = "Choose and justify topic, purpose, audience, form, genre, and medium.";
    updates["D1.2"] = "Develop ideas on challenging topics, including diversity, equity, inclusion, and other subjects, using varied resources.";
    updates["D1.4"] = "Classify and sequence content with effective tools; evaluate form, genre, and medium and consider alternatives.";
    updates["D1.5"] = "Evaluate idea-development and organization tools, explain helpful choices, and plan future improvements.";
    updates["D3.2"] = "Publish and present with varied media/tools and evaluate how the choices conveyed the intended message.";
  }
  return expectations.map(([id, focus]): readonly [string, string] => [id, updates[id] ?? focus])
    .sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }));
}
