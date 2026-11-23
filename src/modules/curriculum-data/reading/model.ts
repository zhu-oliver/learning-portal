import type { Lesson, Question } from "../../types";
import type { GradeContent } from "../types";
import { fill, pairs, sequence, sort, type ActivitySet } from "../../activities/builders";

export type ReadingGrade = 1 | 2 | 3 | 5 | 6 | 7 | 8;
export type Check = readonly [prompt: string, correct: string, wrongOne: string, wrongTwo: string, reason: string];
export interface TopicSection {
  heading: string;
  body: string;
  activity: string;
  expectations: readonly string[];
  practice: Check;
  final: Check;
}
export interface ReadingTopic {
  slug: string;
  title: string;
  strand: string;
  sections: readonly [TopicSection, TopicSection, TopicSection];
  transfer: Check;
  activities: ActivitySet;
}

// Verified 2026-10-11 against each ministry course's l5___specific_expectation
// records: Grades 1/2/3/5/6/7/8 have 63/61/61/59/59/59/59 specifics respectively.
// Public content API: ws.api.dcp.edu.gov.on.ca/content/api/items with
// system.codename[eq]=lang___fra___grade_{grade}, language=en-CA, depth=5.
export const readingSource = (grade: ReadingGrade) =>
  `https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language/grades/grade-${grade}/strands`;

export function check(prompt: string, correct: string, wrongOne: string, wrongTwo: string, reason: string): Check {
  return [prompt, correct, wrongOne, wrongTwo, reason];
}

export function section(
  heading: string, body: string, activity: string, expectations: readonly string[],
  practice: Check, final: Check,
): TopicSection {
  return { heading, body, activity, expectations, practice, final };
}

export function question(spec: Check, id: string, index: number, sectionIndex: number): Question {
  const [prompt, correct, wrongOne, wrongTwo, explanation] = spec;
  const answerIndex = index % 3;
  const options = [wrongOne, wrongTwo];
  options.splice(answerIndex, 0, correct);
  return { id, prompt, options, answerIndex, explanation, sectionIndex };
}

export function gradeContent(
  grade: ReadingGrade, expectations: GradeContent["expectations"], topics: readonly ReadingTopic[],
): GradeContent {
  const lessons: Lesson[] = topics.map((topic) => {
    const slug = `g${grade}-${topic.slug}`;
    return {
      slug, title: topic.title, grade, source: readingSource(grade), strand: topic.strand,
      unitSlug: `g${grade}-${topic.strand.toLowerCase()}-language`,
      unitTitle: ({ A: "Literacy in the world", B: "Language foundations", C: "Reading and responding", D: "Author's workshop" } as const)[topic.strand as "A" | "B" | "C" | "D"],
      durationMinutes: grade < 4 ? 25 : 35,
      introduction: `Investigate ${topic.title.toLowerCase()} through original examples, guided reading, and an adult-supported performance. Practise each part before applying it to a different example in the final check.`,
      expectations: [...new Set(topic.sections.flatMap((s) => s.expectations))],
      sections: topic.sections.map((s, i) => ({
        heading: s.heading, body: s.body, activity: s.activity, expectations: s.expectations,
        questions: [question(s.practice, `${slug}-practice-${i}`, i + grade, i)],
      })),
      questions: [
        question(topic.sections[0].final, `${slug}-final-0`, grade, 0),
        question(topic.transfer, `${slug}-final-transfer`, grade + 1, 0),
        question(topic.sections[1].final, `${slug}-final-1`, grade + 2, 1),
        question(topic.sections[2].final, `${slug}-final-2`, grade + 3, 2),
      ],
    };
  });
  return {
    edition: 2023, source: readingSource(grade), expectations, lessons,
    activities: Object.fromEntries(topics.map((t) => [`g${grade}-${t.slug}`, t.activities])),
  };
}

export function meaningActivities(
  entries: readonly (readonly [string, string])[], before: string, answer: string, reason: string,
  categories: readonly [string, string], choices: readonly (readonly [string, 0 | 1])[],
): ActivitySet {
  return [
    pairs("Match the examples with their meanings or purposes.", entries, reason),
    fill(before, answer, reason),
    sort("Sort these new examples using the lesson's distinction.", categories, choices, reason),
  ];
}

export function processActivities(
  steps: readonly string[], before: string, answer: string, reason: string,
  entries: readonly (readonly [string, string])[],
): ActivitySet {
  return [
    sequence("Arrange this topic's actions in a useful order.", steps, reason),
    fill(before, answer, reason),
    pairs("Match these different examples with the appropriate action.", entries, reason),
  ];
}
