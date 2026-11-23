import type { Lesson } from "./types";
import { grade4Courses, grade4Units } from "./grade4";
import { specificExpectations, overarchingProcesses, type CurriculumSubject } from "./grade4/expectations";
import { curriculumSources } from "./grade4/course";
import { grade2ImmersionLessons } from "./french-immersion";
import { getAdditionalGradeContent } from "./curriculum-data";

export const grades = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function getGradeCourses(subject: string, grade: number, program: "core" | "immersion" = "core"): readonly Lesson[] {
  if (program === "immersion" && subject === "french" && grade === 2) return grade2ImmersionLessons;
  if (program === "core" && grade === 4 && Object.hasOwn(grade4Courses, subject)) return grade4Courses[subject];
  return getAdditionalGradeContent(subject, grade, program)?.lessons ?? [];
}

export function getGradeCourse(subject: string, grade: number, slug: string, program: "core" | "immersion" = "core") {
  return getGradeCourses(subject, grade, program).find((course) => course.slug === slug) ??
    (program === "core" ? getGradeUnit(subject, grade, slug) : undefined);
}

export function parseImmersionGrade(segment: string) {
  const match = /^immersion-grade-([1-8])$/.exec(segment);
  return match ? Number(match[1]) : undefined;
}

export function getGradeUnits(subject: string, grade: number): readonly Lesson[] {
  return grade === 4 && Object.hasOwn(grade4Units, subject) ? grade4Units[subject] : [];
}

export function getGradeUnit(subject: string, grade: number, slug: string) {
  return getGradeUnits(subject, grade).find((unit) => unit.slug === slug);
}

export function parseGrade(segment: string) {
  const match = /^grade-([1-8])$/.exec(segment);
  return match ? Number(match[1]) : undefined;
}

export function getGradeCoverage(subject: string, grade: number, program: "core" | "immersion" = "core") {
  const key = subject === "spelling" ? "reading" : subject;
  const additional = getAdditionalGradeContent(subject, grade, program);
  const courses = getGradeCourses(subject, grade, program);
  const references = courses.flatMap((lesson) => lesson.sections.flatMap((section, index) =>
    (section.expectations ?? []).map((id) => ({ id, lesson: lesson.slug, title: lesson.title, section: section.heading, index })),
  ));
  if (additional) return {
    edition: additional.edition, source: additional.source,
    expectations: [...additional.expectations, ...(additional.processes ?? [])].map(([id, focus]) => ({ id, focus, references: references.filter((reference) => reference.id === id) })),
    specificCount: additional.expectations.length,
  };
  if (program !== "core" || grade !== 4 || !Object.hasOwn(specificExpectations, key)) return undefined;
  const curriculumSubject = key as CurriculumSubject;
  const expected = subject === "spelling" ?
    specificExpectations.reading.filter(([id]) => id.startsWith("B2.")) : specificExpectations[curriculumSubject];
  return {
    ...curriculumSources[curriculumSubject],
    expectations: [...expected, ...(subject === "spelling" ? [] : overarchingProcesses[curriculumSubject] ?? [])]
      .map(([id, focus]) => ({ id, focus, references: references.filter((reference) => reference.id === id) })),
    specificCount: expected.length,
  };
}
