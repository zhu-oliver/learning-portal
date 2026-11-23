import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemPractice } from "./problem-practice";
import { immersionProblems, problemExamples } from "@/modules/problem-examples";
import { ProblemControl } from "./problem-controls";
import { expectedProblemAnswer } from "@/modules/problems";
import { LessonContent } from "@/components/lesson-content";
import { math } from "@/modules/math";
import ActivitiesPage from "@/app/try/activities/page";

vi.mock("@/components/result-save", () => ({ ResultSave: () => <p>Saving final quiz</p> }));

function setup(index: number) {
  render(<ProblemPractice problems={[problemExamples[index]]} />);
  return userEvent.setup();
}
async function selectAndPlace(user: ReturnType<typeof userEvent.setup>, item: string, destination: string) {
  await user.click(screen.getByRole("button", { name: item }));
  await user.click(screen.getByRole("button", { name: destination }));
}
async function checkCorrect(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Check my answer" }));
  expect(screen.getByText("That's right!")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "See practice result" }));
  expect(screen.getByText("1 of 1")).toBeInTheDocument();
}

describe("reusable interactive practice", () => {
  beforeEach(() => { HTMLElement.prototype.setPointerCapture = vi.fn(); });
  it("finds horizontal, vertical and diagonal words, rejects a wrong path and resets the grid", async () => {
    const user = setup(0);
    expect(screen.getByRole("button", { name: "Check my answer" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "C, row 1, column 1" }));
    await user.click(screen.getByRole("button", { name: "N, row 2, column 4" }));
    expect(screen.getByText(/Try another straight line/)).toBeInTheDocument();
    for (const [first, last] of [["C, row 1, column 1", "T, row 1, column 3"], ["D, row 2, column 1", "G, row 4, column 1"], ["P, row 3, column 3", "G, row 5, column 5"]]) {
      await user.click(screen.getByRole("button", { name: first }));
      await user.click(screen.getByRole("button", { name: last }));
    }
    expect(screen.getAllByLabelText("Found")).toHaveLength(3);
    await checkCorrect(user);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.queryByLabelText("Found")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check my answer" })).toBeDisabled();
  });

  it("matches words with pictures, replaces an occupied target and restores removed words", async () => {
    const user = setup(1);
    expect(screen.getAllByRole("img")).toHaveLength(3);
    await selectAndPlace(user, "un chien", "Place here 1");
    expect(screen.queryByRole("button", { name: "un chien" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place here 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Replace match 1" })).not.toBeInTheDocument();
    await selectAndPlace(user, "un chat", "Replace match 1");
    expect(screen.getByRole("button", { name: "un chien" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove un chat" }));
    expect(screen.getByRole("button", { name: "un chat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Place here 1" })).toBeDisabled();
    await selectAndPlace(user, "un chat", "Place here 1");
    await selectAndPlace(user, "un chien", "Place here 2");
    await selectAndPlace(user, "un lapin", "Place here 3");
    await checkCorrect(user);
  });

  it("sorts several items into one category and allows rematching", async () => {
    const user = setup(2);
    expect(screen.queryByRole("button", { name: "Place in Producer" })).not.toBeInTheDocument();
    await selectAndPlace(user, "Rabbit", "Place in Producer");
    expect(screen.queryByRole("button", { name: "Place in Producer" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Rabbit" }));
    for (const [item, category] of [["Rabbit", "Consumer"], ["Grass", "Producer"], ["Fox", "Consumer"], ["Oak tree", "Producer"]]) {
      await selectAndPlace(user, item, `Place in ${category}`);
    }
    await checkCorrect(user);
  });

  it("orders a sequence using accessible move controls", async () => {
    const user = setup(3);
    expect(screen.queryByRole("button", { name: /Place here/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Move up Maya plants a seed." }));
    await user.click(screen.getByRole("button", { name: "Move up Maya checks the pot each morning." }));
    await user.click(screen.getByRole("button", { name: "Move up Maya checks the pot each morning." }));
    await user.click(screen.getByRole("button", { name: "Move up A green shoot appears." }));
    await checkCorrect(user);
  });

  it("matches fraction pairs with keyboard-only selection and placement", async () => {
    const user = setup(4);
    for (const [item, destination] of [["2/4", "Place here 1"], ["2/6", "Place here 2"], ["6/8", "Place here 3"]]) {
      screen.getByRole("button", { name: item }).focus();
      await user.keyboard("{Enter}");
      screen.getByRole("button", { name: destination }).focus();
      await user.keyboard("{Enter}");
    }
    await checkCorrect(user);
  });

  it("labels the numbered diagram using destinations and provides a descriptive alternative", async () => {
    const user = setup(5);
    expect(screen.getByRole("img", { name: /branching roots/ })).toHaveAttribute("src", "/images/plant-parts.svg");
    for (const [item, destination] of [["Leaves", 1], ["Stem", 2], ["Roots", 3]]) {
      await user.click(screen.getByRole("button", { name: String(item) }));
      await user.click(screen.getAllByRole("button", { name: `Place at ${destination}` })[0]);
      expect(screen.queryByRole("button", { name: `Place at ${destination}` })).not.toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: "Remove Leaves" }));
    expect(screen.getAllByRole("button", { name: "Place at 1" })).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Leaves" }));
    await user.click(screen.getAllByRole("button", { name: "Place at 1" })[0]);
    await checkCorrect(user);
  });

  it("shows sequence destinations only while selecting a different position", async () => {
    const user = setup(3);
    await user.click(screen.getByRole("button", { name: "Maya plants a seed." }));
    expect(screen.queryByRole("button", { name: "Place here 2" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Place here 1" }));
    expect(screen.queryByRole("button", { name: /Place here/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move down Maya plants a seed." })).toBeInTheDocument();
  });

  it("keeps diagram replacement available without showing placement prompts on filled labels", async () => {
    const user = setup(5);
    await user.click(screen.getByRole("button", { name: "Leaves" }));
    await user.click(screen.getAllByRole("button", { name: "Place at 1" })[0]);
    expect(screen.queryByRole("button", { name: "Place at 1" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Roots" }));
    await user.click(screen.getByRole("button", { name: "Replace label 1" }));
    expect(screen.getByRole("button", { name: "Leaves" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Replace label 1" })).not.toBeInTheDocument();
  });

  it("accepts a typed blank and locks it after checking", async () => {
    const user = setup(6);
    const input = screen.getByRole("textbox", { name: "Answer for the blank" });
    await user.type(input, "5/7");
    await user.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(input).toBeDisabled();
    expect(screen.getByText("That's right!")).toBeInTheDocument();
  });

  it("highlights misspelled words, allows toggling, and explains wrong answers", async () => {
    const user = setup(7);
    await user.click(screen.getByRole("button", { name: "The" }));
    await user.click(screen.getByRole("button", { name: "The" }));
    expect(screen.getByRole("button", { name: "The" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "paitent" }));
    await user.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(screen.getByText("Not quite. Let's look at the solution.")).toBeInTheDocument();
    expect(screen.getByText("paitent, assigment")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "assigment" })).toBeDisabled();
  });

  it("scores highlighted words irrespective of selection order", async () => {
    const user = setup(7);
    await user.click(screen.getByRole("button", { name: "assigment" }));
    await user.click(screen.getByRole("button", { name: "paitent" }));
    await checkCorrect(user);
  });

  it("uses Pointer Events to drag, cancels outside drops and ignores edits after checking", () => {
    const problem = problemExamples[4];
    const change = vi.fn();
    const { rerender } = render(<ProblemControl problem={problem} answer={[]} onChange={change} disabled={false} language="en" />);
    const token = screen.getByRole("button", { name: "2/4" });
    token.setPointerCapture = vi.fn();
    const drop = screen.getByRole("button", { name: "Place here 1" }).closest("[data-problem-drop]")!;
    const elementFromPoint = vi.fn<() => Element | null>(() => drop);
    vi.stubGlobal("PointerEvent", MouseEvent);
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: elementFromPoint });
    // jsdom's MouseEvent does not include the PointerEvent-only isPrimary field.
    function pointer(type: string, x: number, y: number) {
      const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
      Object.defineProperty(event, "isPrimary", { value: true });
      Object.defineProperty(event, "pointerId", { value: 1 });
      fireEvent(token, event);
    }
    pointer("pointerdown", 10, 10);
    pointer("pointermove", 100, 100);
    pointer("pointerup", 100, 100);
    expect(change).toHaveBeenLastCalledWith(["two-fourths", "", ""]);
    change.mockClear();
    elementFromPoint.mockReturnValue(null);
    pointer("pointerdown", 10, 10); pointer("pointermove", 100, 100); pointer("pointerup", 100, 100);
    expect(change).not.toHaveBeenCalled();
    rerender(<ProblemControl problem={problem} answer={expectedProblemAnswer(problem)} onChange={change} disabled language="en" />);
    expect(screen.getAllByRole("button").every((button) => button.hasAttribute("disabled"))).toBe(true);
  });

  it("offers a mixed practice sequence without any score-saving surface", async () => {
    const user = userEvent.setup();
    render(<ProblemPractice problems={[problemExamples[6], problemExamples[7]]} />);
    await user.type(screen.getByRole("textbox"), "5/7");
    await user.click(screen.getByRole("button", { name: "Check my answer" }));
    await user.click(screen.getByRole("button", { name: "Next activity" }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Activity 2 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "paitent" }));
    await user.click(screen.getByRole("button", { name: "assigment" }));
    await user.click(screen.getByRole("button", { name: "Check my answer" }));
    await user.click(screen.getByRole("button", { name: "See practice result" }));
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    expect(screen.queryByText(/Saving your result/)).not.toBeInTheDocument();
  });

  it("does not suppress a later keyboard activation after dragging and unmatching the same word", async () => {
    const user = setup(1);
    const token = screen.getByRole("button", { name: "un chat" });
    const drop = screen.getByRole("button", { name: "Place here 1" }).closest("[data-problem-drop]")!;
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => drop });
    for (const [type, x] of [["pointerdown", 10], ["pointermove", 100], ["pointerup", 100]] as const) {
      const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: x, button: 0 });
      Object.defineProperty(event, "isPrimary", { value: true });
      Object.defineProperty(event, "pointerId", { value: 1 });
      fireEvent(token, event);
    }
    await user.click(screen.getByRole("button", { name: "Remove un chat" }));
    screen.getByRole("button", { name: "un chat" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "un chat" })).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps French controls French, including fill-answer feedback", async () => {
    const user = userEvent.setup();
    render(<ProblemPractice problems={[immersionProblems[1]]} language="fr" />);
    await user.type(screen.getByRole("textbox", { name: "Réponse dans le blanc" }), "répéter");
    await user.click(screen.getByRole("button", { name: "Vérifier" }));
    expect(screen.getByText("C'est juste !")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Pratique interactive" })).toHaveAttribute("lang", "fr");
  });

  it("renders selected lesson examples without changing the final quiz", () => {
    render(<LessonContent subject={math} lesson={math.lessons[0]} showQuiz={false} />);
    const regions = screen.getAllByRole("region", { name: "Interactive practice" });
    expect(regions).toHaveLength(1);
    expect(within(regions[0]).getByRole("img", { name: /three fifths/ })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "End-of-lesson quiz" })).not.toBeInTheDocument();
  });

  it("publishes eight independently usable showcase samples and direct links", () => {
    render(<ActivitiesPage />);
    const navigation = within(screen.getByRole("navigation", { name: "Activity types" }));
    expect(navigation.getAllByRole("link")).toHaveLength(8);
    expect(screen.getAllByRole("region")).toHaveLength(8);
    problemExamples.forEach((problem) => expect(document.getElementById(problem.id)).toBeInTheDocument());
  });
});
