import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrenchLesson } from "./french-lesson";
import { french } from "@/modules/french";
import { getGradeCourses } from "@/modules/curriculum";
import type { TestAnswers } from "@/lib/results";

const save = vi.hoisted(() => vi.fn());
vi.mock("./result-save", () => ({
  ResultSave: ({ submission }: { submission: TestAnswers }) => {
    save(submission);
    return <p>French result saving connected</p>;
  },
}));

describe("French study and matching", () => {
  beforeEach(() => {
    save.mockClear();
    vi.stubGlobal("speechSynthesis", {
      speak: vi.fn(), cancel: vi.fn(),
      getVoices: vi.fn(() => [{ name: "French voice", lang: "fr-FR" }]),
    });
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string;
      constructor(text: string) { this.text = text; }
    });
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
    HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  it.each([...french.lessons, getGradeCourses("french", 4)[0]])("studies and matches every registered word and image in $slug", async (lesson) => {
    const user = userEvent.setup();
    render(<FrenchLesson lesson={lesson} saveResults />);
    const words = lesson.frenchWords!;
    expect(document.querySelectorAll(".french-study-grid [role=img]")).toHaveLength(words.length);
    expect(screen.getAllByRole("button", { name: /^Listen to/ })).toHaveLength(words.length);
    for (const word of words) expect(screen.getByText(word.english, { exact: true, selector: ".word-meaning" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: `Listen to ${words[0].french}` }));
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({ lang: "fr-FR", rate: .75, text: words[0].french }));
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    expect(screen.getAllByRole("img")).toHaveLength(words.length);
    const imageButtons = screen.getAllByRole("button", { name: /^Image \d/ });
    expect(imageButtons).toHaveLength(words.length);
    const wordButtons = screen.getAllByRole("button", { name: /^\d+\./ });
    const check = screen.getByRole("button", { name: `Check all ${words.length} matches` });
    expect(check).toBeDisabled();
    for (const [index, word] of words.entries()) {
      expect(check).toBeDisabled();
      expect(wordButtons[index]).toHaveAccessibleName(new RegExp(`\\d+\\. ${word.french} Not matched`));
      await user.click(wordButtons[index]);
      const image = imageButtons.find((button) => new RegExp(`^Image \\d+: ${word.english}$`).test(button.getAttribute("aria-label")!))!;
      await user.click(image);
    }
    expect(screen.getByText(`${words.length} / ${words.length} matched`)).toBeInTheDocument();
    expect(check).toBeEnabled();
    expect(screen.queryByRole("button", { name: /^\d+\./ })).not.toBeInTheDocument();
    expect(screen.getByText(/All words matched!/)).toBeInTheDocument();
    const firstImage = imageButtons.find((button) => button.dataset.matchingImage === words[0].id)!;
    await user.click(firstImage);
    expect(check).toBeDisabled();
    expect(screen.getByText(`${words.length - 1} / ${words.length} matched`)).toBeInTheDocument();
    const returned = screen.getByRole("button", { name: new RegExp(`1\\. ${words[0].french} Not matched`) });
    expect(returned).toHaveFocus();
    await user.click(returned);
    await user.click(firstImage);
    expect(check).toBeEnabled();
    await user.click(check);
    expect(screen.getByText(`${words.length} / ${words.length}`, { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("French result saving connected")).toBeInTheDocument();
    expect(save).toHaveBeenCalledWith({
      kind: "matching", lesson: lesson.slug,
      ...(lesson.grade ? { grade: lesson.grade } : {}),
      imageIds: words.map((word) => word.id),
    });
    await user.click(screen.getByRole("button", { name: "Try a new matching quiz" }));
    expect(screen.getByText(`0 / ${words.length} matched`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Check all ${words.length} matches` })).toBeDisabled();
  }, 30000);

  it("moves an already assigned image rather than allowing duplicate matches", async () => {
    const user = userEvent.setup();
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    await user.click(screen.getByRole("button", { name: /1\. le chat Not matched/ }));
    const cat = screen.getByRole("button", { name: /^Image \d+: cat$/ });
    await user.click(cat);
    await user.click(screen.getByRole("button", { name: /2\. le chien Not matched/ }));
    await user.click(cat);
    expect(screen.getByText("1 / 10 matched")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1\. le chat Not matched/ })).toBeInTheDocument();
    expect(within(screen.getByRole("status")).getByText(/Matched le chien/)).toBeInTheDocument();
  });

  it.each(["mouse", "touch", "pen"])("drags a word directly onto an image using %s and preserves one-to-one matches", async (pointerType) => {
    const user = userEvent.setup();
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    const catWord = screen.getByRole("button", { name: /1\. le chat Not matched/ });
    const dogWord = screen.getByRole("button", { name: /2\. le chien Not matched/ });
    const catImage = screen.getByRole("button", { name: /^Image \d+: cat$/ });
    const dogImage = screen.getByRole("button", { name: /^Image \d+: dog$/ });
    const hitTest = vi.fn(() => catImage);
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: hitTest });
    const pointer = { pointerId: 1, isPrimary: true, button: 0, pointerType, clientX: 30, clientY: 100 };
    const dragTo = (word: HTMLElement) => {
      fireEvent.pointerDown(pointerType === "mouse" ? word : word.querySelector("[data-drag-handle]")!, pointer);
      fireEvent.pointerMove(word, { ...pointer, clientX: 230, clientY: 150 });
      expect(catImage).toHaveClass("drop-target");
      fireEvent.pointerUp(word, { ...pointer, clientX: 230, clientY: 150 });
      fireEvent.click(word, { detail: 1 });
    };
    dragTo(catWord);
    expect(screen.getByText("1 / 10 matched")).toBeInTheDocument();
    expect(catWord).not.toBeInTheDocument();
    expect(catImage).toHaveAccessibleName(/matched to le chat/);
    expect(screen.queryByText("le chat", { selector: ".matching-drag-preview" })).not.toBeInTheDocument();
    dragTo(dogWord);
    expect(screen.getByText("1 / 10 matched")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1\. le chat Not matched/ })).toBeInTheDocument();
    expect(dogWord).not.toBeInTheDocument();
    expect(catImage).toHaveAccessibleName(/matched to le chien/);
    await user.click(catImage);
    expect(screen.getByText("0 / 10 matched")).toBeInTheDocument();
    const returnedDog = screen.getByRole("button", { name: /2\. le chien Not matched/ });
    expect(returnedDog).toHaveFocus();
    hitTest.mockReturnValue(dogImage);
    fireEvent.pointerDown(pointerType === "mouse" ? returnedDog : returnedDog.querySelector("[data-drag-handle]")!, pointer);
    fireEvent.pointerMove(returnedDog, { ...pointer, clientX: 250, clientY: 150 });
    fireEvent.pointerUp(returnedDog, { ...pointer, clientX: 250, clientY: 150 });
    expect(dogImage).toHaveAccessibleName(/matched to le chien/);
    expect(catImage).toHaveAccessibleName(/^Image \d+: cat$/);
    expect(screen.getByText("1 / 10 matched")).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it.each([french.lessons[0], french.lessons.find((lesson) => lesson.slug === "classroom")!])(
    "completes and saves every match by dragging in $slug", async (lesson) => {
      const user = userEvent.setup();
      render(<FrenchLesson lesson={lesson} saveResults />);
      await user.click(screen.getByRole("button", { name: /start matching/ }));
      const words = lesson.frenchWords!;
      const sources = screen.getAllByRole("button", { name: /^\d+\./ });
      const targets = screen.getAllByRole("button", { name: /^Image \d/ });
      const hitTest = vi.fn(() => targets[0]);
      Object.defineProperty(document, "elementFromPoint", { configurable: true, value: hitTest });
      const pointer = { pointerId: 1, isPrimary: true, button: 0, pointerType: "mouse", clientX: 30, clientY: 100 };
      const check = screen.getByRole("button", { name: `Check all ${words.length} matches` });
      for (const [index, word] of words.entries()) {
        expect(check).toBeDisabled();
        hitTest.mockReturnValue(targets.find((target) => target.dataset.matchingImage === word.id)!);
        fireEvent.pointerDown(sources[index], pointer);
        fireEvent.pointerMove(sources[index], { ...pointer, clientX: 230, clientY: 150 });
        fireEvent.pointerUp(sources[index], { ...pointer, clientX: 230, clientY: 150 });
        fireEvent.click(sources[index], { detail: 1 });
      }
      expect(check).toBeEnabled();
      await user.click(check);
      expect(screen.getByText(`${words.length} / ${words.length}`, { selector: "strong" })).toBeInTheDocument();
      expect(save).toHaveBeenCalledWith({ kind: "matching", lesson: lesson.slug, imageIds: words.map((word) => word.id) });
    },
  );

  it("does not change a match when a drag is cancelled or released outside the image bank", async () => {
    const user = userEvent.setup();
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    const word = screen.getByRole("button", { name: /1\. le chat Not matched/ });
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: vi.fn(() => null) });
    const pointer = { pointerId: 1, isPrimary: true, button: 0, pointerType: "touch", clientX: 30, clientY: 100 };
    for (const cancel of [false, true]) {
      fireEvent.pointerDown(word.querySelector("[data-drag-handle]")!, pointer);
      fireEvent.pointerMove(word, { ...pointer, clientX: 130, clientY: 150 });
      if (cancel) fireEvent.pointerCancel(word, pointer);
      else fireEvent.pointerUp(word, { ...pointer, clientX: 130, clientY: 150 });
      expect(screen.getByText("0 / 10 matched")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("No match changed");
      expect(word).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("leaves touch swipes outside the grip available for scrolling the word bank", async () => {
    const user = userEvent.setup();
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    const word = screen.getByRole("button", { name: /1\. le chat Not matched/ });
    const pointer = { pointerId: 1, isPrimary: true, button: 0, pointerType: "touch", clientX: 30, clientY: 100 };
    fireEvent.pointerDown(word, pointer);
    fireEvent.pointerMove(word, { ...pointer, clientY: 200 });
    expect(word.setPointerCapture).not.toHaveBeenCalled();
    expect(screen.queryByText("le chat", { selector: ".matching-drag-preview" })).not.toBeInTheDocument();
    expect(screen.getByText("0 / 10 matched")).toBeInTheDocument();
  });

  it("supports keyboard selection and matching without dragging", async () => {
    const user = userEvent.setup();
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    const word = screen.getByRole("button", { name: /1\. le chat Not matched/ });
    word.focus();
    await user.keyboard("{Enter}");
    const image = screen.getByRole("button", { name: /^Image \d+: cat$/ });
    image.focus();
    await user.keyboard(" ");
    expect(screen.getByText("1 / 10 matched")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Matched le chat");
    expect(word).not.toBeInTheDocument();
    expect(image).toHaveFocus();
    await user.keyboard(" ");
    const returned = screen.getByRole("button", { name: /1\. le chat Not matched/ });
    expect(returned).toHaveFocus();
    expect(screen.getByText("0 / 10 matched")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("The word is back in the list");
    expect(image).toBeDisabled();
    await user.keyboard("{Enter}{Enter}");
    expect(returned).toHaveAttribute("aria-pressed", "false");
  });

  it("scrolls at the screen edge during a drag and cancels its animation when leaving", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    const word = screen.getByRole("button", { name: /1\. le chat Not matched/ });
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: vi.fn(() => null) });
    const frames: FrameRequestCallback[] = [];
    const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const scroll = vi.spyOn(window, "scrollBy").mockImplementation(() => {});
    const pointer = { pointerId: 1, isPrimary: true, button: 0, pointerType: "mouse", clientX: 30, clientY: 100 };
    fireEvent.pointerDown(word, pointer);
    fireEvent.pointerMove(word, { ...pointer, clientY: window.innerHeight - 5 });
    act(() => frames[0](0));
    expect(scroll).toHaveBeenCalledWith(0, expect.any(Number));
    expect(scroll.mock.calls[0][1]).toBeGreaterThan(0);
    unmount();
    expect(cancel).toHaveBeenCalled();
    request.mockRestore();
    cancel.mockRestore();
    scroll.mockRestore();
  });

  it("does not silently read French with an English voice", async () => {
    const user = userEvent.setup();
    vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([]);
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: "Listen to le chat" }));
    expect(screen.getByRole("alert")).toHaveTextContent("French voice is not available");
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("surfaces unsupported speech and never saves public samples", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("speechSynthesis", undefined);
    render(<FrenchLesson lesson={french.lessons[0]} />);
    await user.click(screen.getByRole("button", { name: "Listen to le chat" }));
    expect(screen.getByRole("alert")).toHaveTextContent("not supported");
    await user.click(screen.getByRole("button", { name: /start matching/ }));
    const words = french.lessons[0].frenchWords!;
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const wrong = words[(index + 1) % words.length];
      await user.click(screen.getByRole("button", { name: new RegExp(`\\d+\\. ${word.french} Not matched`) }));
      await user.click(screen.getByRole("button", { name: new RegExp(`^Image \\d+: ${wrong.english}$`) }));
    }
    await user.click(screen.getByRole("button", { name: "Check all 10 matches" }));
    expect(screen.getByText("0 / 10", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("Public sample: results are not saved.")).toBeInTheDocument();
    expect(screen.queryByText("French result saving connected")).not.toBeInTheDocument();
  }, 20000);
});
