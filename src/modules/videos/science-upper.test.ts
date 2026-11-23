import { describe, expect, it } from "vitest";
import { getGradeCourses } from "../curriculum";
import { scienceUpperVideos } from "./science-upper";

describe("curated upper-grade science videos", () => {
  const lessons = [5, 6, 7, 8].flatMap((grade) => getGradeCourses("science", grade));

  it("explicitly covers exactly the 53 actual lesson slugs", () => {
    expect(lessons).toHaveLength(53);
    expect(Object.keys(scienceUpperVideos).sort()).toEqual(lessons.map(({ slug }) => slug).sort());
  });

  it.each(lessons)("provides bounded, verified enrichment for $slug", ({ slug }) => {
    const videos = scienceUpperVideos[slug];
    expect(videos).toHaveLength(1);
    for (const video of videos) {
      expect(video.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(Number.isInteger(video.durationSeconds)).toBe(true);
      expect(video.durationSeconds).toBeGreaterThan(0);
      expect(video.durationSeconds).toBeLessThanOrEqual(480);
      expect(video.verifiedAt).toBe("2026-10-11");
      expect(video.channel.trim().length).toBeGreaterThan(0);
      for (const field of ["title", "learningFocus", "question"] as const) {
        expect(video[field].trim().length).toBeGreaterThan(10);
      }
      expect(video.question.endsWith("?")).toBe(true);
    }
  });

  it("keeps reused metadata consistent and lesson reflections distinct", () => {
    const metadata = new Map<string, string>();
    const reflections = new Set<string>();
    for (const videos of Object.values(scienceUpperVideos)) {
      for (const { videoId, title, channel, durationSeconds, verifiedAt, learningFocus, question } of videos) {
        const signature = JSON.stringify({ title, channel, durationSeconds, verifiedAt });
        if (metadata.has(videoId)) expect(signature).toBe(metadata.get(videoId));
        metadata.set(videoId, signature);
        const reflection = JSON.stringify({ learningFocus, question });
        expect(reflections.has(reflection)).toBe(false);
        reflections.add(reflection);
      }
    }
    expect(metadata.size).toBe(45);
  });
});
