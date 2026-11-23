import type { Lesson } from "./types";
import { mathCourses } from "./grade4/math";
import { languageCourses, spellingCourses } from "./grade4/language";
import { scienceCourses } from "./grade4/science";
import { frenchCourses } from "./grade4/french";
import { expandTopics } from "./grade4/depth";
import { mathDepth } from "./grade4/math-depth";
import { scienceDepth } from "./grade4/science-depth";
import { languageDepth } from "./grade4/language-depth";
import { frenchDepth } from "./grade4/french-depth";

export const grade4Units: Readonly<Record<string, readonly Lesson[]>> = {
  math: mathCourses, reading: [...languageCourses, ...spellingCourses], science: scienceCourses,
  spelling: spellingCourses, french: frenchCourses,
};

export const grade4Courses: Readonly<Record<string, readonly Lesson[]>> = {
  math: expandTopics(mathCourses, mathDepth),
  reading: [...expandTopics(languageCourses, languageDepth), ...expandTopics(spellingCourses, languageDepth)],
  science: expandTopics(scienceCourses, scienceDepth),
  spelling: expandTopics(spellingCourses, languageDepth),
  french: expandTopics(frenchCourses, frenchDepth),
};
