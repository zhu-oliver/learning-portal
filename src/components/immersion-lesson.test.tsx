import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { grade2ImmersionLessons } from "@/modules/french-immersion";
import { ImmersionLesson } from "./immersion-lesson";
import { Quiz } from "./quiz";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("./result-save", () => ({ ResultSave: ({ submission }: { submission: unknown }) => {
  mocks.save(submission);
  return <p>Save connected</p>;
} }));

describe("French-first immersion learning", () => {
  beforeEach(() => {
    vi.stubGlobal("speechSynthesis", { cancel: vi.fn(), speak: vi.fn(), getVoices: vi.fn(() => [
      { lang: "en-CA", name: "English" }, { lang: "fr-CA", name: "French" },
    ]) });
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string;
      constructor(text: string) { this.text = text; }
    });
  });

  it("keeps English help collapsed and reads each teaching section in French", () => {
    const lesson = grade2ImmersionLessons[0];
    render(<ImmersionLesson lesson={lesson} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(lesson.title);
    const help = screen.getAllByText("English help (optional)");
    expect(help).toHaveLength(3);
    help.forEach((summary) => expect(summary.closest("details")).not.toHaveAttribute("open"));
    expect(screen.getAllByRole("region", { name: "Petite pratique" })).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: `Écouter : ${lesson.sections[0].heading}` }));
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({ lang: "fr-CA", text: expect.stringContaining(lesson.sections[0].body) }));
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("runs a French independent final quiz, including audio, and submits the immersion identity", async () => {
    const user = userEvent.setup();
    const lesson = grade2ImmersionLessons[0];
    render(<Quiz questions={lesson.questions} title="Quiz de la leçon" language="fr"
      activity={{ subject: "french", grade: 2, program: "immersion", lesson: lesson.slug }} />);
    for (const question of lesson.questions) {
      if (question.listeningText) {
        fireEvent.click(screen.getByRole("button", { name: "Écouter : Message à écouter" }));
        expect(window.speechSynthesis.speak).toHaveBeenLastCalledWith(expect.objectContaining({ lang: "fr-CA", text: expect.stringContaining(question.listeningText) }));
        expect(screen.getByText("Transcription (aide facultative)").closest("details")).not.toHaveAttribute("open");
      }
      await user.click(screen.getByRole("radio", { name: question.options[question.answerIndex] }));
      await user.click(screen.getByRole("button", { name: "Vérifier ma réponse" }));
      await user.click(screen.getByRole("button", { name: /Question suivante|Voir mon résultat/ }));
    }
    expect(mocks.save).toHaveBeenLastCalledWith({
      kind: "quiz", subject: "french", grade: 2, program: "immersion", lesson: lesson.slug,
      answers: lesson.questions.map((question) => question.answerIndex),
    });
    expect(screen.getByRole("heading", { name: "Bravo pour tes efforts !" })).toBeInTheDocument();
  });

  it("reports a missing French voice rather than silently using an English voice", () => {
    vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([{ lang: "en-CA", name: "English", default: true, localService: true, voiceURI: "english-test" }]);
    render(<ImmersionLesson lesson={grade2ImmersionLessons[0]} />);
    fireEvent.click(screen.getAllByRole("button", { name: /^Écouter :/ })[0]);
    expect(screen.getByRole("alert")).toHaveTextContent("Aucune voix française");
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });
});
