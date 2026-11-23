import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Quiz } from "./quiz";
import { math } from "@/modules/math";
import { subjects } from "@/modules";
import { problemExamples } from "@/modules/problem-examples";
import { wordSearchPath, wordAtPath } from "@/modules/problems";

vi.mock("./result-save", () => ({ ResultSave: () => <p>Result saving enabled</p> }));

describe("practice quiz", () => {
  beforeEach(() => { HTMLElement.prototype.setPointerCapture = vi.fn(); });
  it("keeps repeated section quizzes' headings and radio groups independent", async () => {
    const user = userEvent.setup();
    render(<><Quiz questions={math.lessons[0].questions} /><Quiz questions={math.lessons[0].questions} /></>);
    const quizzes = screen.getAllByRole("region", { name: /brain stretch/i });
    const first = within(quizzes[0]).getAllByRole("radio")[0];
    const second = within(quizzes[1]).getAllByRole("radio")[0];
    expect(quizzes[0].getAttribute("aria-labelledby")).not.toBe(quizzes[1].getAttribute("aria-labelledby"));
    expect(first.getAttribute("name")).not.toBe(second.getAttribute("name"));
    await user.click(first);
    await user.click(second);
    expect(first).toBeChecked();
    expect(second).toBeChecked();
    expect(within(quizzes[0]).getByRole("button", { name: /check my answer/i })).toBeEnabled();
    expect(within(quizzes[1]).getByRole("button", { name: /check my answer/i })).toBeEnabled();
  });
  it("requires an answer, explains mistakes, and prevents changing a checked answer", async () => {
    const user = userEvent.setup();
    render(<Quiz questions={math.lessons[0].questions} />);
    expect(screen.getByRole("button", { name: /check my answer/i })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "How many parts we have" }));
    await user.click(screen.getByRole("button", { name: /check my answer/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
    expect(screen.getByRole("status")).toHaveTextContent(math.lessons[0].questions[0].explanation);
    for (const option of screen.getAllByRole("radio")) expect(option).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /next question/i }));
    expect(screen.getByText("Question 2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check my answer/i })).toBeDisabled();
    expect(screen.getByRole("heading", { name: /brain stretch/i })).toHaveFocus();
  });

  it.each(subjects.filter((subject) => subject.lessons[0]?.questions.length).map((subject) => [subject.title, subject.lessons[0]] as const))(
    "scores all %s answers once and resets the entire quiz on retry",
    async (_title, lesson) => {
      const user = userEvent.setup();
      render(<Quiz questions={lesson.questions} />);
      for (const question of lesson.questions) {
        await user.click(screen.getByRole("radio", { name: question.options[question.answerIndex] }));
        await user.click(screen.getByRole("button", { name: /check my answer/i }));
        expect(screen.getByRole("status")).toHaveTextContent("That's right!");
        await user.click(screen.getByRole("button", { name: /next question|see my results/i }));
      }
      expect(screen.getByText("You got every answer right!")).toBeInTheDocument();
      expect(screen.getByText(/You answered 3 of 3/)).toBeInTheDocument();
      expect(screen.getByText(/results are not saved or shared/i)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /try again/i }));
      expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
      for (const question of lesson.questions) {
        const wrongIndex = (question.answerIndex + 1) % question.options.length;
        await user.click(screen.getByRole("radio", { name: question.options[wrongIndex] }));
        await user.click(screen.getByRole("button", { name: /check my answer/i }));
        await user.click(screen.getByRole("button", { name: /next question|see my results/i }));
      }
      expect(screen.getByText(/You answered 0 of 3/)).toBeInTheDocument();
    },
  );

  it.each(problemExamples)("uses the same quiz scoring and retry flow for $type", async (problem) => {
    const user = userEvent.setup();
    render(<Quiz questions={[]} problems={[problem]} />);
    switch (problem.type) {
      case "fill":
        await user.type(screen.getByRole("textbox"), problem.accepted[0]);
        break;
      case "pairs":
        for (const [index, id] of problem.matches.entries()) {
          await user.click(screen.getByRole("button", { name: problem.right.find((item) => item.id === id)!.text }));
          await user.click(screen.getByRole("button", { name: `Place here ${index + 1}` }));
        }
        break;
      case "picture-match":
        for (const [index, picture] of problem.pictures.entries()) {
          await user.click(screen.getByRole("button", { name: problem.words.find((item) => item.id === picture.wordId)!.text }));
          await user.click(screen.getByRole("button", { name: `Place here ${index + 1}` }));
        }
        break;
      case "sort":
        for (const item of problem.items) {
          await user.click(screen.getByRole("button", { name: item.text }));
          await user.click(screen.getByRole("button", { name: `Place in ${problem.categories.find((category) => category.id === item.categoryId)!.text}` }));
        }
        break;
      case "diagram":
        for (const [index, target] of problem.targets.entries()) {
          await user.click(screen.getByRole("button", { name: problem.labels.find((label) => label.id === target.labelId)!.text }));
          await user.click(screen.getAllByRole("button", { name: `Place at ${index + 1}` })[0]);
        }
        break;
      case "sequence":
        for (const [index, id] of problem.order.entries()) {
          const text = problem.items.find((item) => item.id === id)!.text;
          while (Number(screen.getByRole("button", { name: text }).closest("li")!.dataset.target) > index) {
            await user.click(screen.getByRole("button", { name: `Move up ${text}` }));
          }
        }
        break;
      case "spelling-highlight":
        for (const index of problem.incorrect) await user.click(screen.getByRole("button", { name: problem.tokens[index] }));
        break;
      case "word-search": {
        const width = problem.grid[0].length, size = width * problem.grid.length;
        for (const word of problem.words) {
          let endpoints: [number, number] | undefined;
          for (let start = 0; start < size && !endpoints; start++) {
            for (let end = 0; end < size && !endpoints; end++) {
              if (wordAtPath(problem.grid, wordSearchPath(problem.grid, start, end)) === word.text) endpoints = [start, end];
            }
          }
          if (!endpoints) throw new Error(`Word not found: ${word.text}`);
          for (const cell of endpoints) {
            const row = Math.floor(cell / width), column = cell % width;
            await user.click(screen.getByRole("button", { name: `${problem.grid[row][column]}, row ${row + 1}, column ${column + 1}` }));
          }
        }
        break;
      }
    }
    await user.click(screen.getByRole("button", { name: "Check my answer" }));
    expect(screen.getByText("That's right!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See my results" }));
    expect(screen.getByText(/You answered 1 of 1/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
    expect(screen.queryByText("Solution:")).not.toBeInTheDocument();
  }, 15000);
});
