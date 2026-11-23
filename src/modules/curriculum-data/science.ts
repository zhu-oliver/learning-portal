import type { GradeContentMap } from "./types";
import { makeGrade } from "./science/build";
import { grade1 } from "./science/grade1";
import { grade2 } from "./science/grade2";
import { grade3 } from "./science/grade3";
import { grade5 } from "./science/grade5";
import { grade6 } from "./science/grade6";
import { grade7 } from "./science/grade7";
import { grade8 } from "./science/grade8";

export const scienceGradeContent: GradeContentMap = {
  1: makeGrade(1, grade1),
  2: makeGrade(2, grade2),
  3: makeGrade(3, grade3),
  5: makeGrade(5, grade5),
  6: makeGrade(6, grade6),
  7: makeGrade(7, grade7),
  8: makeGrade(8, grade8),
};
