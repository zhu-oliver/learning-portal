import type { GradeContentMap } from "./types";
import { core5, core6, core7, core8 } from "./french/core";
import { immersion1, immersion3, immersion4 } from "./french/immersion-primary";
import { immersion5, immersion6 } from "./french/immersion-junior";
import { immersion7, immersion8 } from "./french/immersion-intermediate";

export const coreFrenchGradeContent: GradeContentMap = { 5: core5, 6: core6, 7: core7, 8: core8 };
export const immersionGradeContent: GradeContentMap = { 1: immersion1, 3: immersion3, 4: immersion4, 5: immersion5, 6: immersion6, 7: immersion7, 8: immersion8 };
