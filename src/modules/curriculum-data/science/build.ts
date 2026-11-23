import type { Lesson, Question } from "../../types";
import { pairs, sequence, sort, fill, search, type ActivityBank } from "../../activities/builders";
import type { GradeContent } from "../types";
import { verifiedExpectations, topicNames } from "./expectations";
import type { Problem } from "../../problems";

// Each assessment supplies its own scenario, distractors, and scientific rationale.
export type Check = readonly [prompt: string, correct: string, wrongOne: string, wrongTwo: string, explanation: string];
export interface Section {
  heading: string;
  ids: readonly string[];
  body: string;
  activity: string;
}
export interface Topic {
  slug: string;
  title: string;
  strand: "A" | "B" | "C" | "D" | "E";
  sections: readonly [Section, Section, Section];
  practice: Check;
  finals: readonly [Check, Check, Check, Check];
  matches: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  // An ordered physical process or investigation, not an unordered vocabulary list.
  steps: readonly [string, string, string];
  sort?: readonly [categories: readonly [string, string], entries: readonly (readonly [string, 0 | 1])[]];
  blank?: readonly [before: string, answer: string, explanation: string];
  diagram?: Problem;
  words?: readonly string[];
}

function question(check: Check, id: string, sectionIndex: number, offset: number): Question {
  const [prompt, correct, wrongOne, wrongTwo, explanation] = check;
  const options = [correct, wrongOne, wrongTwo];
  const shift = offset % 3;
  return { id, prompt, options: [...options.slice(shift), ...options.slice(0, shift)],
    answerIndex: (3 - shift) % 3, explanation, sectionIndex };
}

export function makeGrade(grade: number, topics: readonly Topic[]): GradeContent {
  const source = `https://www.dcp.edu.gov.on.ca/en/curriculum/science-technology/grades/grade-${grade}/strands`;
  const activities: Record<string, ActivityBank[string]> = {};
  const lessons: Lesson[] = topics.map((topic, index) => {
    const slug = `g${grade}-${topic.slug}`;
    const ids = [...new Set(topic.sections.flatMap((section) => section.ids))];
    const rationale = topic.matches.map(([term, meaning]) => `${term}: ${meaning}`).join("; ");
    const activityPractice = topic.words
      ? search(topic.words, `Explain the terms after finding them: ${rationale}.`,
        `Find the property words for ${topic.title.toLowerCase()}, then explain what each measures or describes.`)
      : pairs(`Connect the evidence and concepts in ${topic.title.toLowerCase()}.`, topic.matches,
        `These connections explain this topic: ${rationale}.`);
    const activityOne = topic.sort
      ? sort(`Classify these ${topic.title.toLowerCase()} examples.`, topic.sort[0], topic.sort[1], rationale)
      : sequence(`Put this ${topic.title.toLowerCase()} process in causal order.`, topic.steps,
        `The order matters: ${topic.steps.join(" Then ")}.`);
    const activityTwo = topic.diagram ?? (topic.blank
      ? fill(topic.blank[0], topic.blank[1], topic.blank[2])
      : sequence(`Trace the investigation in ${topic.title.toLowerCase()}.`, topic.steps,
        `Use the first observation to support the next step: ${topic.steps.join(" ")}`));
    activities[slug] = [activityPractice, activityOne, activityTwo];
    return {
      slug, grade, title: topic.title, strand: `${topic.strand} · ${topicNames[grade][topic.strand]}`,
      source, unitSlug: `g${grade}-${topic.strand.toLowerCase()}`, unitTitle: topicNames[grade][topic.strand],
      durationMinutes: grade < 4 ? 25 : 35,
      introduction: `Investigate ${topic.title.toLowerCase()} using observations, models, and evidence. Explain not only what happens, but why. An adult must select safe materials and supervise practical work.`,
      expectations: ids,
      sections: topic.sections.map((section, sectionIndex) => ({
        ...section, expectations: section.ids,
        body: `${section.body}\n\nWorked reasoning: ${topic.finals[[0, 2, 3][sectionIndex]][4]}${sectionIndex === 0 ? ` ${topic.finals[1][4]}` : ""}`,
        activity: `An adult selects materials and supervises this investigation. ${section.activity} Record evidence without tasting materials, touching wildlife, or using heat or mains electricity.`,
        questions: [sectionIndex === 0 ? question(topic.practice, `${slug}-practice`, 0, index)
          : question([
            `For ${topic.title.toLowerCase()}, which explanation describes ${topic.matches[sectionIndex][0].toLowerCase()}?`,
            topic.matches[sectionIndex][1], topic.matches[(sectionIndex + 1) % 3][1], topic.matches[(sectionIndex + 2) % 3][1],
            `${topic.matches[sectionIndex][0]}: ${topic.matches[sectionIndex][1]}. ${topic.finals[sectionIndex + 1][4]}`,
          ], `${slug}-practice-${sectionIndex + 1}`, sectionIndex, index + sectionIndex)],
      })),
      questions: topic.finals.map((check, i) => question(check, `${slug}-final-${i + 1}`, [0, 0, 1, 2][i], index + i + 1)),
    };
  });
  return { edition: 2022, source, expectations: verifiedExpectations[grade], lessons, activities };
}

export function section(heading: string, ids: string, body: string, activity: string): Section {
  return { heading, ids: ids.split(" "), body, activity };
}

export function topic(
  slug: string, title: string, strand: Topic["strand"], sections: Topic["sections"],
  finals: Topic["finals"], matches: Topic["matches"], steps: Topic["steps"],
  classification?: Topic["sort"],
  words?: Topic["words"],
): Topic {
  return {
    slug, title, strand, sections, finals, matches, steps, sort: classification, words,
    practice: [`In ${title.toLowerCase()}, which description matches ${matches[0][0].toLowerCase()}?`,
      matches[0][1], matches[1][1], matches[2][1],
      `${matches[0][0]} means ${matches[0][1].toLowerCase()}; the other descriptions refer to ${matches[1][0]} and ${matches[2][0]}.`],
    blank: [`In this topic, the term for "${matches[1][1].toLowerCase()}" is`,
      matches[1][0].toLowerCase(), `${matches[1][0]}: ${matches[1][1]}. ${finals[2][4]}`],
  };
}
