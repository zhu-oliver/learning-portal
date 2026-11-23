import { describe, expect, it } from "vitest";
import { aiDocumentSchema, aiOutputJsonSchema, aiQuizQuestions, parseAiDocument, parseGeneratedAiDocument, studioCreateSchema } from "./ai-content";
import { documentFixture, richDocumentFixture } from "@/test/ai-fixture";

describe("versioned AI learning documents", () => {
  it("round-trips compact JSON with stable typed questions and adapts to the existing quiz", () => {
    const saved = JSON.stringify(documentFixture);
    expect(parseAiDocument(JSON.parse(saved), 1)).toEqual(documentFixture);
    expect(aiQuizQuestions(documentFixture)[0]).toEqual({
      id: "q1", prompt: documentFixture.questions[0].prompt,
      options: ["A plant", "A rabbit", "A fox", "An owl"], answerIndex: 0, explanation: documentFixture.questions[0].explanation,
    });
    expect(aiOutputJsonSchema).toHaveProperty("additionalProperties", false);
  });
  it("rejects unsupported versions/types rather than guessing how to render them", () => {
    expect(() => parseAiDocument({ ...documentFixture, schemaVersion: 2 })).toThrow();
    expect(() => parseAiDocument({ ...documentFixture, questions: [{ ...documentFixture.questions[0], type: "fill" }] })).toThrow();
    expect(() => parseAiDocument({ ...documentFixture, userId: "forged" })).toThrow();
  });
  it("requires unique question and option IDs/text and a real correct choice", () => {
    const question = documentFixture.questions[0];
    for (const bad of [
      { ...question, correctOptionId: "missing" },
      { ...question, options: [question.options[0], question.options[0], ...question.options.slice(2)] },
      { ...question, options: question.options.map((option) => ({ ...option, text: "same" })) },
    ]) expect(aiDocumentSchema.safeParse({ ...documentFixture, questions: [bad] }).success).toBe(false);
    expect(aiDocumentSchema.safeParse({ ...documentFixture, questions: [question, question] }).success).toBe(false);
  });
  it("enforces measurable question counts, string and byte bounds", () => {
    expect(() => parseAiDocument(documentFixture, 2)).toThrow("count");
    expect(() => parseAiDocument({ ...documentFixture, title: "x".repeat(121) })).toThrow();
    expect(() => parseAiDocument({ ...documentFixture, sections: [{ heading: "Topic", body: "x".repeat(5001) }] })).toThrow();
    expect(() => parseAiDocument({ ...documentFixture, questions: [] })).toThrow();
    const big = {
      ...documentFixture, sections: Array.from({ length: 4 }, () => ({ heading: "Heading", body: "字".repeat(1500) })),
      questions: Array.from({ length: 10 }, (_, index) => ({
        ...documentFixture.questions[0], id: `q${index}`, prompt: `Question ${index}`,
        options: ["a", "b", "c", "d"].map((id) => ({ id, text: id + "字".repeat(249) })), explanation: "字".repeat(700),
      })),
    };
    expect(() => parseAiDocument(big)).toThrow("size limit");
  });
  it("rejects oversized or identity-bearing creation payloads", () => {
    const request = { requestId: "10000000-0000-4000-8000-000000000001", prompt: "Teach me plants", grade: 4, questionCount: 5, previousId: null };
    expect(studioCreateSchema.safeParse(request).success).toBe(true);
    for (const change of [{ userId: "another-user" }, { prompt: "x".repeat(2001) }, { grade: 9 }, { questionCount: 11 }]) {
      expect(studioCreateSchema.safeParse({ ...request, ...change }).success).toBe(false);
    }
  });
  it("requires substantial new generations without rejecting existing brief saved lessons", () => {
    expect(parseAiDocument(documentFixture)).toEqual(documentFixture);
    expect(parseGeneratedAiDocument(richDocumentFixture, 1)).toEqual(richDocumentFixture);
    expect(() => parseGeneratedAiDocument(documentFixture, 1)).toThrow();
    const body = Array(110).fill("sunlight").join(" ");
    expect(() => parseGeneratedAiDocument({ ...richDocumentFixture, sections: richDocumentFixture.sections.map((section) => ({ ...section, body })) }, 1)).toThrow("too brief");
    const sections = [...richDocumentFixture.sections];
    sections[0] = { ...sections[0], body: "A".repeat(600) };
    expect(() => parseGeneratedAiDocument({ ...richDocumentFixture, sections }, 1)).toThrow("too brief");
  });
  it.each([1, 2, 7, 8, 12])("accepts and round-trips a substantial %i-section topic with no fixed grouping", (count) => {
    const body = Array(Math.max(60, Math.ceil(500 / count))).fill("sunlight").join(" ");
    const document = { ...documentFixture, sections: Array.from({ length: count }, (_, index) => ({ heading: `Topic ${index + 1}`, body })) };
    expect(parseGeneratedAiDocument(document, 1)).toEqual(document);
    expect(parseAiDocument(JSON.parse(JSON.stringify(document)))).toEqual(document);
  });
  it("retains section, depth and byte bounds when section counts vary", () => {
    const sections = Array.from({ length: 13 }, (_, index) => ({ heading: `Topic ${index + 1}`, body: Array(100).fill("sunlight").join(" ") }));
    expect(() => parseAiDocument({ ...documentFixture, sections })).toThrow();
    expect(() => parseGeneratedAiDocument({ ...documentFixture, sections: [] }, 1)).toThrow();
    const shortSections = sections.slice(0, 7).map((section) => ({ ...section, body: Array(59).fill("sunlight").join(" ") }));
    shortSections[0] = { ...shortSections[0], body: Array(200).fill("sunlight").join(" ") };
    expect(() => parseGeneratedAiDocument({ ...documentFixture, sections: shortSections }, 1)).toThrow("too brief");
    const oversized = sections.slice(0, 12).map((section) => ({ ...section, body: "字".repeat(2500) }));
    expect(() => parseAiDocument({ ...documentFixture, sections: oversized })).toThrow("size limit");
  });
  it("publishes a flexible model schema rather than a four-section constraint", () => {
    expect(aiOutputJsonSchema).toHaveProperty("properties.sections.minItems", 1);
    expect(aiOutputJsonSchema).toHaveProperty("properties.sections.maxItems", 12);
  });
});
