import type { Lesson } from "./types";
import type { Problem } from "./problems";
import type { ActivityBank } from "./activities/builders";
import { mathActivities } from "./activities/math";
import { readingActivities } from "./activities/reading";
import { scienceActivities } from "./activities/science";
import { coreFrenchActivities, immersionActivities } from "./activities/french";
import { getAdditionalGradeContent } from "./curriculum-data";

const banks: Readonly<Record<string, ActivityBank>> = {
  math: mathActivities, reading: readingActivities, science: scienceActivities, french: coreFrenchActivities,
};

export function getLessonActivities(subject: string, lesson: Lesson): { practice: readonly Problem[]; final: readonly Problem[] } | undefined {
  const key = subject === "spelling" ? "reading" : subject;
  const additional = lesson.grade ? getAdditionalGradeContent(key, lesson.grade, lesson.program) : undefined;
  const bank = additional?.activities ?? (lesson.program === "immersion" && key === "french" ? immersionActivities : Object.hasOwn(banks, key) ? banks[key] : undefined);
  const activities = bank && Object.hasOwn(bank, lesson.slug) ? bank[lesson.slug] : undefined;
  if (!activities) return undefined;
  function identify(problem: Problem, phase: string, index: number): Problem {
    return { ...problem, id: `${lesson.slug}-${phase}-${index}`, ...(lesson.program === "immersion" && problem.type === "fill" ? { prompt: "Complète la phrase." } : {}) };
  }
  return { practice: [identify(activities[0], "practice", 0)], final: activities.slice(1).map((problem, index) => identify(problem, "final", index)) };
}
