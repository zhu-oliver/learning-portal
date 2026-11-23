import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getGradeCourses } from "../curriculum";
import { science } from "../science";
import { math } from "../math";
import { getScienceLessonVideos } from "./science";
import { scienceLowerVideos } from "./science-lower";
import { scienceUpperVideos } from "./science-upper";
import { LessonContent } from "@/components/lesson-content";

vi.mock("@/components/result-save", () => ({ ResultSave: () => null }));

const lessons = [...Array.from({ length: 8 }, (_, index) => getGradeCourses("science", index + 1)).flat(), ...science.lessons];

describe("Science enrichment coverage", () => {
  it("maps exactly all 105 teaching lessons, with no stale or overlapping keys", () => {
    expect(lessons).toHaveLength(105);
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(105);
    expect(Object.keys(scienceLowerVideos).filter((slug) => Object.hasOwn(scienceUpperVideos, slug))).toEqual([]);
    expect([...Object.keys(scienceLowerVideos), ...Object.keys(scienceUpperVideos)].sort()).toEqual(lessons.map((lesson) => lesson.slug).sort());
  });
  it.each(lessons.map((lesson) => [lesson.slug, lesson] as const))("has safe complete short-video metadata for %s", (_, lesson) => {
    const videos = getScienceLessonVideos(lesson);
    expect(videos?.length).toBeGreaterThan(0);
    expect(videos?.length).toBeLessThanOrEqual(2);
    expect(new Set(videos?.map((video) => video.videoId)).size).toBe(videos?.length);
    for (const video of videos ?? []) {
      expect(video.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(video.title.trim().length).toBeGreaterThan(5);
      expect(video.channel.trim().length).toBeGreaterThan(2);
      expect(Number.isInteger(video.durationSeconds)).toBe(true);
      expect(video.durationSeconds).toBeGreaterThan(0);
      expect(video.durationSeconds).toBeLessThanOrEqual(480);
      expect(video.learningFocus.trim().length).toBeGreaterThan(30);
      expect(video.question.trim().length).toBeGreaterThan(15);
      expect(video.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("does not resolve prototype keys or unknown lessons", () => {
    for (const slug of ["toString", "__proto__", "not-a-lesson"]) {
      expect(getScienceLessonVideos({ ...science.lessons[0], slug })).toBeUndefined();
    }
  });
  it("shows enrichment on Science study pages without starting a player or a final quiz", () => {
    const { container } = render(<LessonContent subject={science} lesson={lessons[0]} showQuiz={false} />);
    expect(screen.getByRole("region", { name: "Extend your knowledge" })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "Section practice" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("region", { name: "End-of-lesson quiz" })).not.toBeInTheDocument();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });
  it("does not add Science videos to other subjects, even with a colliding slug", () => {
    render(<LessonContent subject={math} lesson={{ ...math.lessons[0], slug: lessons[0].slug }} showQuiz={false} />);
    expect(screen.queryByRole("region", { name: "Extend your knowledge" })).not.toBeInTheDocument();
  });
});
