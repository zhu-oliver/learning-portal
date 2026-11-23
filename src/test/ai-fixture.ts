import type { AiDocument } from "@/modules/ai-content";

export const documentFixture: AiDocument = {
  schemaVersion: 1, title: "Food chains", summary: "Learn how energy moves between living things.",
  sections: [{ heading: "Energy in a food chain", body: "Plants use sunlight. A rabbit eats plants, and a fox may eat the rabbit." }],
  questions: [{
    type: "multiple-choice", id: "q1", prompt: "Which living thing makes food using sunlight?",
    options: [{ id: "a", text: "A plant" }, { id: "b", text: "A rabbit" }, { id: "c", text: "A fox" }, { id: "d", text: "An owl" }],
    correctOptionId: "a", explanation: "Plants use energy from sunlight to make food.",
  }],
};

export const richDocumentFixture: AiDocument = {
  ...documentFixture,
  sections: Array.from({ length: 4 }, (_, index) => ({
    heading: `Teaching section ${index + 1}`,
    body: Array(12).fill(documentFixture.sections[0].body).join("\n\n"),
  })),
};
