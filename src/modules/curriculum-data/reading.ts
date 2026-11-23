import type { GradeContentMap } from "./types";
import { comprehensionTopics } from "./reading/comprehension";
import { readingExpectations } from "./reading/expectations";
import { foundationTopics } from "./reading/foundations";
import { mediaWritingTopics } from "./reading/media-writing";
import { gradeContent, type ReadingGrade } from "./reading/model";
import { primaryCodeTopics } from "./reading/primary-code";

const grades: readonly ReadingGrade[] = [1, 2, 3, 5, 6, 7, 8];

export const readingGradeContent: GradeContentMap = Object.fromEntries(grades.map((grade) => [
  grade,
  gradeContent(grade, readingExpectations(grade), [
    ...foundationTopics(grade), ...primaryCodeTopics(grade), ...comprehensionTopics(grade), ...mediaWritingTopics(grade),
  ]),
]));
