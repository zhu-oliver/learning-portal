import { scienceLowerVideos } from "./science-lower";
import { scienceUpperVideos } from "./science-upper";
import type { Lesson } from "../types";
import type { ScienceVideoBank } from "./types";

const videos: ScienceVideoBank = { ...scienceLowerVideos, ...scienceUpperVideos };

export function getScienceLessonVideos(lesson: Lesson) {
  return Object.hasOwn(videos, lesson.slug) ? videos[lesson.slug] : undefined;
}
