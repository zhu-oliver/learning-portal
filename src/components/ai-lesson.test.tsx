import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { documentFixture } from "@/test/ai-fixture";
import type { StudioItem } from "@/modules/ai-content";
import { AiLesson } from "./ai-lesson";

vi.mock("./result-save", () => ({ ResultSave: () => { throw new Error("AI quiz attempts must not be persisted"); } }));
const id = "10000000-0000-4000-8000-000000000001";
const lesson: StudioItem = { id, title: documentFixture.title, document: documentFixture, status: "ready", createdAt: "2026-11-06T00:00:00Z", error: null };

describe("separate AI lesson and quiz", () => {
  it("renders every section of a seven-item topic without truncating its reading or audio controls", () => {
    const document = { ...documentFixture, sections: Array.from({ length: 7 }, (_, index) => ({ heading: `Wonder ${index + 1}`, body: `Details for wonder ${index + 1}.` })) };
    render(<AiLesson lesson={{ ...lesson, document }} />);
    for (let index = 1; index <= 7; index++) {
      expect(screen.getByRole("heading", { name: `Wonder ${index}` })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: `Read section: Wonder ${index}` })).toBeInTheDocument();
      expect(screen.getByText(`Details for wonder ${index}.`)).toBeInTheDocument();
    }
  });
  it("renders older saved content and its unsaved quiz without a prompt or library", async () => {
    const user = userEvent.setup();
    render(<AiLesson lesson={lesson} />);
    const heading = screen.getByRole("heading", { name: "Energy in a food chain" });
    expect(heading.parentElement).toContainElement(screen.getByRole("button", { name: "Read section: Energy in a food chain" }));
    expect(screen.getByRole("link", { name: "Revise this lesson" })).toHaveAttribute("href", `/learn/studio?revise=${id}`);
    expect(screen.getByRole("link", { name: "Go to quiz" })).toHaveAttribute("href", "#ai-lesson-quiz");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "My saved learning" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "A plant" }));
    await user.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(screen.getByText("That's right!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See my results" }));
    expect(screen.getByText("You got every answer right!")).toBeInTheDocument();
    expect(screen.getByText(/AI-generated practice: answers and scores are not saved/)).toBeInTheDocument();
  });
  it("handles bookmarked pending and failed lessons explicitly", () => {
    const { rerender } = render(<AiLesson lesson={{ ...lesson, status: "processing", document: null }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Generating Lesson...");
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    rerender(<AiLesson lesson={{ ...lesson, status: "failed", document: null, error: "Model unavailable" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Model unavailable");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
