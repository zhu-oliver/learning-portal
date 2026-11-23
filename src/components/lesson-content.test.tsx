import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LessonContent } from "./lesson-content";
import { getGradeCourses } from "@/modules/curriculum";
import { getSubject } from "@/modules";
import type { TestAnswers } from "@/lib/results";
import LessonQuizPage from "@/app/learn/[subject]/[lesson]/[course]/quiz/page";
import { getLessonActivities } from "@/modules/activities";
import { correctQuizAnswers, quizEntries } from "@/modules/quiz-entries";

const save = vi.hoisted(() => vi.fn());
vi.mock("@/lib/session", () => ({ requireUser: vi.fn(async () => ({ id: "google:test-user" })) }));
vi.mock("./result-save", () => ({
  ResultSave: ({ submission }: { submission: TestAnswers }) => {
    save(submission);
    return <p>Saving final quiz</p>;
  },
}));

describe("lesson practice and final assessment", () => {
  it("never saves section practice and saves only the complete lesson quiz", async () => {
    save.mockClear();
    const user = userEvent.setup();
    const lesson = getGradeCourses("math", 4)[0];
    const { unmount } = render(<LessonContent subject={getSubject("math")!} lesson={lesson} showQuiz={false} />);
    const practice = within(screen.getAllByRole("region", { name: "Section practice" })[0]);
    for (const question of lesson.sections[0].questions!) {
      await user.click(practice.getByRole("radio", { name: question.options[question.answerIndex] }));
      await user.click(practice.getByRole("button", { name: "Check my answer" }));
      await user.click(practice.getByRole("button", { name: /Next question|See my results/ }));
    }
    expect(save).not.toHaveBeenCalled();
    expect(practice.getByText(/do not count toward your lesson quiz/)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "End-of-lesson quiz" })).not.toBeInTheDocument();
    unmount();
    render(await LessonQuizPage({ params: Promise.resolve({ subject: "math", lesson: "grade-4", course: lesson.slug }) }));
    const final = within(screen.getByRole("region", { name: "End-of-lesson quiz" }));
    const entries = quizEntries(lesson.questions, getLessonActivities("math", lesson)?.final);
    for (const entry of entries) {
      if (entry.kind === "choice") {
        const question = entry.question;
        await user.click(final.getByRole("radio", { name: question.options[question.answerIndex] }));
      } else if (entry.problem.type === "fill") {
        await user.type(final.getByRole("textbox"), entry.problem.accepted[0]);
      } else if (entry.problem.type === "sequence") {
        for (const [index, id] of entry.problem.order.entries()) {
          const text = entry.problem.items.find((item) => item.id === id)!.text;
          while (Number(final.getByRole("button", { name: text }).closest("li")!.dataset.target) > index) {
            await user.click(final.getByRole("button", { name: `Move up ${text}` }));
          }
        }
      } else throw new Error("Update the test's interaction for this lesson activity.");
      await user.click(final.getByRole("button", { name: "Check my answer" }));
      await user.click(final.getByRole("button", { name: /Next question|See my results/ }));
    }
    expect(save).toHaveBeenCalledWith({
      kind: "quiz", subject: "math", lesson: lesson.slug, grade: 4, quizVersion: 1,
      answers: correctQuizAnswers(entries),
    });
    expect(final.getByText(`You answered ${entries.length} of ${entries.length} questions correctly. Revisit the lesson or try again at your own pace.`)).toBeInTheDocument();
  }, 20000);
});
