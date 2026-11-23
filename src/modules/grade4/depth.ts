import type { Lesson, Question } from "../types";

export type Check = readonly [prompt: string, options: readonly string[], answerIndex: number, explanation: string];
export interface DeeperSection {
  heading: string;
  body: string;
  activity: string;
  practice: Check;
  assessment: Check;
}
export interface TopicExpansion {
  slug: string;
  sections: readonly [DeeperSection, DeeperSection];
}
export type DepthMap = Readonly<Record<string, readonly TopicExpansion[]>>;

export function detail(heading: string, body: string, activity: string, practice: Check, assessment: Check): DeeperSection {
  return { heading, body, activity, practice, assessment };
}

function question(check: Check, id: string, sectionIndex: number): Question {
  const [prompt, options, answerIndex, explanation] = check;
  return { id, sectionIndex, prompt, options, answerIndex, explanation };
}

export function expandTopics(units: readonly Lesson[], depth: DepthMap): readonly Lesson[] {
  return units.flatMap((unit) => {
    const topics = Object.hasOwn(depth, unit.slug) ? depth[unit.slug] : undefined;
    if (!topics || topics.length !== unit.sections.length) throw new Error(`Every topic needs deeper content in ${unit.slug}.`);
    return unit.sections.map((foundation, index): Lesson => {
      const topic = topics[index];
      const slug = `${unit.slug}-${topic.slug}`;
      const originalAssessment = unit.questions.filter((item) => item.sectionIndex === index);
      if (!originalAssessment.length) throw new Error(`Missing assessment for ${slug}.`);
      const sections: Lesson["sections"] = [
        { ...foundation },
        ...topic.sections.map((section, sectionIndex) => ({
          heading: section.heading, body: section.body, activity: section.activity,
          questions: [question(section.practice, `practice-${sectionIndex + 1}`, sectionIndex + 1)],
        })),
      ];
      return {
        ...unit, slug, title: foundation.heading, unitSlug: unit.slug, unitTitle: unit.title,
        introduction: `Explore this topic from ${unit.title}: build the key ideas, work through an example, and investigate or apply what you learn.`,
        durationMinutes: 35,
        frenchWords: index === 0 ? unit.frenchWords : undefined,
        expectations: foundation.expectations,
        sections,
        questions: [
          ...originalAssessment.map((item) => ({ ...item, sectionIndex: 0 })),
          ...topic.sections.map((section, sectionIndex) =>
            question(section.assessment, `final-depth-${sectionIndex + 1}`, sectionIndex + 1)),
        ],
      };
    });
  });
}
