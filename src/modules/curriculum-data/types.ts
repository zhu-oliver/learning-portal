import type { Lesson } from "../types";
import type { ActivityBank } from "../activities/builders";

export interface GradeContent {
  edition: number;
  source: string;
  expectations: readonly (readonly [id: string, focus: string])[];
  processes?: readonly (readonly [id: string, focus: string])[];
  lessons: readonly Lesson[];
  activities: ActivityBank;
}

export type GradeContentMap = Readonly<Partial<Record<number, GradeContent>>>;
