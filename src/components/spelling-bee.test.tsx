import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpellingBee } from "./spelling-bee";
import { spellingLists } from "@/modules/spelling";

vi.mock("./result-save", () => ({ ResultSave: () => <p>Result save connected</p> }));

describe("Spelling Bee", () => {
  beforeEach(() => {
    vi.stubGlobal("speechSynthesis", { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn(() => []) });
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string;
      constructor(text: string) { this.text = text; }
    });
  });

  it("supports custom spelling, blank answers, review and missed-word practice", async () => {
    const user = userEvent.setup();
    render(<SpellingBee />);
    await user.selectOptions(screen.getByLabelText("Word list"), "custom");
    await user.type(screen.getByLabelText("Your words"), "apple, pear");
    await user.click(screen.getByRole("button", { name: "Start the bee" }));
    expect(screen.getByLabelText("Spell the word")).toHaveFocus();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    await user.type(screen.getByLabelText("Spell the word"), "APPLE");
    await user.click(screen.getByRole("button", { name: "Next word" }));
    await user.click(screen.getByRole("button", { name: "Hear the word again" }));
    await user.click(screen.getByRole("button", { name: "Finish spelling" }));
    expect(screen.getByText("Your answer: (blank)")).toBeInTheDocument();
    expect(screen.getByText("Correct: apple")).toBeInTheDocument();
    expect(screen.queryByText("Result save connected")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /practice missed words/i }));
    expect(screen.getByText("Word 1 of 1")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Spell the word"), "pear");
    await user.keyboard("{Enter}");
    expect(screen.getByText("Correct: pear")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "New word list" }));
    expect(screen.getByLabelText("Word list")).toBeInTheDocument();
  });

  it.each([2, 3])("runs Lesson %i spelling then vocabulary and connects completed results to saving", async (number) => {
    const user = userEvent.setup();
    render(<SpellingBee saveResults initialListId={`test-${number}`} quizTitle={`Lesson ${number} — quiz`} />);
    expect(screen.queryByLabelText("Word list")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start quiz" }));
    const list = spellingLists[number - 1];
    for (const word of list.words) {
      await user.type(screen.getByLabelText("Spell the word"), word);
      await user.keyboard("{Enter}");
    }
    for (const question of list.vocabulary) {
      expect(screen.getByRole("button", { name: /next question|see my results/i })).toBeDisabled();
      await user.click(screen.getByRole("radio", { name: question.options[question.answerIndex] }));
      await user.click(screen.getByRole("button", { name: /next question|see my results/i }));
    }
    expect(screen.getByText(`${list.words.length * 2} / ${list.words.length * 2}`)).toBeInTheDocument();
    expect(screen.getByText("Result save connected")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "All done!" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Try this quiz again" }));
    expect(screen.getByText(new RegExp(`${list.words.length} spelling words`))).toBeInTheDocument();
  }, 20000);

  it("surfaces invalid custom lists without starting", async () => {
    const user = userEvent.setup();
    render(<SpellingBee />);
    await user.selectOptions(screen.getByLabelText("Word list"), "custom");
    await user.click(screen.getByRole("button", { name: "Start the bee" }));
    expect(screen.getByRole("alert")).toHaveTextContent("between 1 and 50");
  });

  it("explains missing read-aloud support", () => {
    vi.stubGlobal("speechSynthesis", undefined);
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);
    // Delete the properties to emulate a browser without speech APIs.
    Reflect.deleteProperty(window, "speechSynthesis");
    Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
    render(<SpellingBee />);
    expect(screen.getByRole("alert")).toHaveTextContent("not supported");
  });
});
