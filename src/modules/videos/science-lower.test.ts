import { describe, expect, it } from "vitest";
import { getGradeCourses } from "../curriculum";
import { science } from "../science";
import { scienceLowerVideos } from "./science-lower";

describe("lower-grade science video enrichment", () => {
  const lessons = [
    ...[1, 2, 3, 4].flatMap((grade) => getGradeCourses("science", grade)),
    ...science.lessons,
  ];

  it("explicitly covers exactly the 52 published lessons", () => {
    expect(lessons).toHaveLength(52);
    expect(Object.keys(scienceLowerVideos).sort()).toEqual(lessons.map(({ slug }) => slug).sort());
  });

  it.each(lessons.map(({ slug, title }) => [slug, title] as const))(
    "has bounded, attributed enrichment for %s (%s)",
    (slug) => {
      const videos = scienceLowerVideos[slug];
      expect(videos.length).toBeGreaterThanOrEqual(1);
      expect(videos.length).toBeLessThanOrEqual(2);
      for (const item of videos) {
        expect(item.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
        expect(item.title.trim().length).toBeGreaterThan(5);
        expect(item.channel.trim().length).toBeGreaterThan(2);
        expect(Number.isInteger(item.durationSeconds)).toBe(true);
        expect(item.durationSeconds).toBeGreaterThan(0);
        expect(item.durationSeconds).toBeLessThanOrEqual(480);
        expect(item.learningFocus.trim().length).toBeGreaterThan(30);
        expect(item.question).toMatch(/\?$/);
        expect(item.verifiedAt).toBe("2026-10-11");
      }
    },
  );

  it("keeps reused source metadata consistent while tailoring lesson guidance", () => {
    const metadata = new Map<string, string>();
    const guidance = new Set<string>();
    for (const videos of Object.values(scienceLowerVideos)) {
      for (const item of videos) {
        const signature = JSON.stringify([item.title, item.channel, item.durationSeconds, item.verifiedAt]);
        if (metadata.has(item.videoId)) expect(signature).toBe(metadata.get(item.videoId));
        metadata.set(item.videoId, signature);
        expect(guidance.has(item.learningFocus)).toBe(false);
        guidance.add(item.learningFocus);
      }
    }
    expect(metadata.size).toBe(40);
  });

  it("retains independently verified metadata, including unrounded durations", () => {
    const starter = scienceLowerVideos["water-on-the-move"][0];
    expect([starter.videoId, starter.title, starter.channel, starter.durationSeconds]).toEqual([
      "R0K7VKkksyc", "Where Does Water Come From? | Ecology for Kids", "SciShow Kids", 262,
    ]);
    expect(scienceLowerVideos["g2-substance-symbols-and-safe-storage"][0].durationSeconds).toBe(30);
    expect(scienceLowerVideos["g3-soil-components-and-ontario-crops"][0].durationSeconds).toBe(405);
    expect(scienceLowerVideos["g3-coding-a-science-model"][0].channel).toBe("CodeAI");
  });
});
