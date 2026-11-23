import type { Lesson, Question } from "../types";
import { getAssessmentQuestions } from "./assessments";

export const curriculumSources = {
  math: { edition: 2020, source: "https://dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics" },
  reading: { edition: 2023, source: "https://dcp.edu.gov.on.ca/en/curriculum/elementary-language" },
  science: { edition: 2022, source: "https://dcp.edu.gov.on.ca/en/curriculum/science-technology" },
  french: { edition: 2013, source: "https://dcp.edu.gov.on.ca/en/curriculum/elementary-fsl" },
} as const;

type CurriculumSubject = keyof typeof curriculumSources;
type Check = readonly [prompt: string, options: readonly string[], answerIndex: number, explanation: string];

export function study(
  heading: string, expectations: readonly string[], body: string, activity: string, checks: readonly Check[],
): Lesson["sections"][number] {
  return {
    heading, expectations, body, activity,
    questions: checks.map(([prompt, options, answerIndex, explanation], index): Question => ({
      id: `check-${index + 1}`, prompt, options, answerIndex, explanation,
    })),
  };
}

export function course(
  subject: CurriculumSubject, slug: string, title: string, strand: string,
  introduction: string, sections: Lesson["sections"],
): Lesson {
  return {
    slug, title, strand, introduction, sections, grade: 4,
    durationMinutes: sections.length * 20,
    expectations: [...new Set(sections.flatMap((section) => section.expectations ?? []))],
    source: curriculumSources[subject].source,
    questions: getAssessmentQuestions(slug, sections.length),
  };
}
