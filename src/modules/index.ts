import { math } from "./math";
import { reading } from "./reading";
import { science } from "./science";
import { spelling } from "./spelling";
import { french } from "./french";
import type { SubjectModule } from "./types";

export const subjects: readonly SubjectModule[] = [math, reading, science, french];

export function getSubject(slug: string) {
  return slug === "spelling" ? spelling : subjects.find((subject) => subject.slug === slug);
}

export function getLesson(subjectSlug: string, lessonSlug: string) {
  return getSubject(subjectSlug)?.lessons.find((lesson) => lesson.slug === lessonSlug);
}
