import { mathGradeContent } from "./math";
import { readingGradeContent } from "./reading";
import { scienceGradeContent } from "./science";
import { coreFrenchGradeContent, immersionGradeContent } from "./french";
import type { GradeContentMap } from "./types";

const subjects: Readonly<Record<string, GradeContentMap>> = {
  math: mathGradeContent,
  reading: readingGradeContent,
  science: scienceGradeContent,
  french: coreFrenchGradeContent,
};

export function getAdditionalGradeContent(subject: string, grade: number, program: "core" | "immersion" = "core") {
  if (program === "immersion") return subject === "french" ? immersionGradeContent[grade] : undefined;
  return Object.hasOwn(subjects, subject) ? subjects[subject][grade] : undefined;
}
