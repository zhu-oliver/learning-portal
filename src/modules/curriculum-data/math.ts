import type { GradeContentMap } from "./types";
import { grade1Math } from "./math/grade1";
import { grade2Math } from "./math/grade2";
import { grade3Math } from "./math/grade3";
import { grade5Math } from "./math/grade5";
import { grade6Math } from "./math/grade6";
import { grade7Math } from "./math/grade7";
import { grade8Math } from "./math/grade8";

export { mathSpecificExpectations, mathProcesses, mathResearchSources } from "./math/expectations";
export const mathGradeContent: GradeContentMap = {
  1: grade1Math, 2: grade2Math, 3: grade3Math, 5: grade5Math,
  6: grade6Math, 7: grade7Math, 8: grade8Math,
};
