export type SubjectTheme = "math" | "reading" | "science" | "spelling" | "french";

export interface FrenchWord {
  id: string;
  french: string;
  english: string;
  note: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: readonly string[];
  answerIndex: number;
  explanation: string;
  sectionIndex?: number;
  listeningText?: string;
}

export interface Lesson {
  slug: string;
  title: string;
  durationMinutes: number;
  introduction: string;
  sections: readonly {
    heading: string;
    body: string;
    activity?: string;
    questions?: readonly Question[];
    problems?: readonly Problem[];
    expectations?: readonly string[];
  }[];
  questions: readonly Question[];
  frenchWords?: readonly FrenchWord[];
  grade?: number;
  strand?: string;
  expectations?: readonly string[];
  source?: string;
  program?: "core" | "immersion";
  unitSlug?: string;
  unitTitle?: string;
}

export interface SubjectModule {
  slug: string;
  title: string;
  theme: SubjectTheme;
  tagline: string;
  description: string;
  lessons: readonly Lesson[];
  activity?: "spelling";
}
import type { Problem } from "./problems";
