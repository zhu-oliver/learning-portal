import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  notFound: vi.fn((): never => { throw new Error("not-found"); }),
  redirect: vi.fn((url: string): never => { throw new Error(`redirect:${url}`); }),
}));
vi.mock("@/lib/session", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound, redirect: mocks.redirect }));
vi.mock("@/components/result-save", () => ({ ResultSave: () => <p>Result saving enabled</p> }));

import DashboardPage from "./page";
import GamesPage from "./games/page";
import SubjectPage from "./[subject]/page";
import LessonPage from "./[subject]/[lesson]/page";
import CoursePage from "./[subject]/[lesson]/[course]/page";
import LessonQuizPage from "./[subject]/[lesson]/[course]/quiz/page";
import { getGradeCourses } from "@/modules/curriculum";
import { mentalMathActivities } from "@/modules/mental-math";
import { grade2ImmersionLessons } from "@/modules/french-immersion";

describe("learning pages", () => {
  beforeEach(() => { mocks.requireUser.mockResolvedValue({ id: "google-user-id", name: "Alex Explorer" }); });

  it("returns to immersion selection and lists all ten Grade 2 lessons with a coverage map", async () => {
    const { unmount } = render(await SubjectPage({ params: Promise.resolve({ subject: "french" }), searchParams: Promise.resolve({ program: "immersion" }) }));
    expect(screen.getByRole("radio", { name: "French Immersion students" })).toBeChecked();
    expect(screen.getByRole("link", { name: /Grade 2 10 French Immersion lessons/ })).toHaveAttribute("href", "/learn/french/immersion-grade-2");
    unmount();
    render(await LessonPage({ params: Promise.resolve({ subject: "french", lesson: "immersion-grade-2" }) }));
    expect(screen.getByText("Curriculum learning map — 39 specific expectations")).toBeInTheDocument();
    for (const lesson of grade2ImmersionLessons) {
      expect(screen.getByRole("link", { name: new RegExp(`${lesson.strand} ${lesson.title}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toHaveAttribute("href", `/learn/french/immersion-grade-2/${lesson.slug}`);
    }
    expect(screen.getByRole("link", { name: "French Immersion — grades" })).toHaveAttribute("href", "/learn/french?program=immersion");
  });

  it("opens French-first lesson practice and its separate independent final quiz", async () => {
    const lesson = grade2ImmersionLessons[0];
    const params = Promise.resolve({ subject: "french", lesson: "immersion-grade-2", course: lesson.slug });
    const { unmount } = render(await CoursePage({ params }));
    expect(screen.getAllByRole("region", { name: "Petite pratique" })).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Commencer le quiz" })).toHaveAttribute("href", `/learn/french/immersion-grade-2/${lesson.slug}/quiz`);
    unmount();
    render(await LessonQuizPage({ params }));
    expect(screen.getByRole("heading", { name: `${lesson.title} — quiz` })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Petite pratique" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retour à la leçon" })).toHaveAttribute("href", `/learn/french/immersion-grade-2/${lesson.slug}`);
  });

  it.each([
    ...["math", "reading", "science"].flatMap((subject) => [1, 3, 5, 8].map((grade) => ({ subject, grade, program: "core" as const }))),
    ...[5, 8].map((grade) => ({ subject: "french", grade, program: "core" as const })),
    ...[1, 3, 8].map((grade) => ({ subject: "french", grade, program: "immersion" as const })),
  ])("renders new $subject grade $grade $program catalog, lesson and separate quiz", async ({ subject, grade, program }) => {
    const course = getGradeCourses(subject, grade, program)[0];
    const segment = `${program === "immersion" ? "immersion-" : ""}grade-${grade}`;
    const { unmount: unmountCatalog } = render(await LessonPage({ params: Promise.resolve({ subject, lesson: segment }) }));
    expect(screen.getByRole("heading", { name: "Ontario learning map" })).toBeInTheDocument();
    const lessonHeading = screen.getByRole("heading", { name: course.title, level: program === "immersion" ? 2 : 3 });
    expect(lessonHeading.closest("a")).toHaveAttribute("href", `/learn/${subject}/${segment}/${course.slug}`);
    expect(screen.queryByText(/Coverage is incomplete/)).not.toBeInTheDocument();
    const mapLinks = screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.includes(`${course.slug}#section-`));
    expect(mapLinks.length).toBeGreaterThan(0);
    unmountCatalog();
    const params = Promise.resolve({ subject, lesson: segment, course: course.slug });
    const { unmount: unmountLesson } = render(await CoursePage({ params }));
    const french = program === "immersion";
    expect(screen.getByRole("heading", { level: 1, name: course.title })).toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: french ? "Petite pratique" : "Section practice" })).toHaveLength(3);
    expect(screen.getByRole("region", { name: french ? "Pratique interactive" : "Interactive practice" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: french ? /^Écouter :/ : /^Read section:/ })).toHaveLength(3);
    expect(screen.getByRole("link", { name: french ? "Commencer le quiz" : "Start end-of-lesson quiz" })).toHaveAttribute("href", `/learn/${subject}/${segment}/${course.slug}/quiz`);
    if (french) {
      expect(screen.getAllByText("English help (optional)")).toHaveLength(3);
      expect(screen.getByText(new RegExp(`IMMERSION FRANÇAISE · ${grade === 1 ? "1re" : `${grade}e`} ANNÉE`))).toBeInTheDocument();
    }
    unmountLesson();
    render(await LessonQuizPage({ params }));
    expect(screen.getByRole("heading", { level: 1, name: `${course.title} — quiz` })).toBeInTheDocument();
    expect(screen.getByText(french ? "Question 1 sur 6" : "Question 1 of 6")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: french ? "Petite pratique" : "Section practice" })).not.toBeInTheDocument();
  });

  it("keeps Grades 1–3 Core French enrichment separate from the Immersion curriculum", async () => {
    render(await LessonPage({ params: Promise.resolve({ subject: "french", lesson: "grade-1" }) }));
    expect(screen.getByText(/Use the shared vocabulary practice for optional enrichment/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore shared French vocabulary" })).toHaveAttribute("href", "/learn/french/practice");
    expect(screen.getByRole("link", { name: "French Immersion — Grade 1" })).toHaveAttribute("href", "/learn/french/immersion-grade-1");
    expect(screen.queryByRole("heading", { name: "Ontario learning map" })).not.toBeInTheDocument();
    const immersion = getGradeCourses("french", 1, "immersion")[0];
    await expect(CoursePage({ params: Promise.resolve({ subject: "french", lesson: "grade-1", course: immersion.slug }) })).rejects.toThrow("not-found");
    await expect(LessonQuizPage({ params: Promise.resolve({ subject: "french", lesson: "grade-1", course: immersion.slug }) })).rejects.toThrow("not-found");
  });

  it("publishes additional immersion grades, rejects invalid programs, and protects all immersion routes", async () => {
    render(await LessonPage({ params: Promise.resolve({ subject: "french", lesson: "immersion-grade-3" }) }));
    expect(screen.getByRole("heading", { name: "French Immersion — Grade 3" })).toBeInTheDocument();
    expect(screen.queryByText(/no published lessons/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ontario learning map" })).toBeInTheDocument();
    await expect(SubjectPage({ params: Promise.resolve({ subject: "french" }), searchParams: Promise.resolve({ program: "invalid" }) })).rejects.toThrow("not-found");
    await expect(CoursePage({ params: Promise.resolve({ subject: "french", lesson: "immersion-grade-2", course: "missing" }) })).rejects.toThrow("not-found");
    await expect(LessonQuizPage({ params: Promise.resolve({ subject: "french", lesson: "grade-2", course: grade2ImmersionLessons[0].slug }) })).rejects.toThrow("not-found");
    mocks.requireUser.mockRejectedValue(new Error("login-required"));
    await expect(SubjectPage({ params: Promise.resolve({ subject: "french" }) })).rejects.toThrow("login-required");
    await expect(LessonPage({ params: Promise.resolve({ subject: "french", lesson: "immersion-grade-2" }) })).rejects.toThrow("login-required");
    const params = Promise.resolve({ subject: "french", lesson: "immersion-grade-2", course: grade2ImmersionLessons[0].slug });
    await expect(CoursePage({ params })).rejects.toThrow("login-required");
    await expect(LessonQuizPage({ params })).rejects.toThrow("login-required");
  });

  it("links every subject from the authenticated dashboard", async () => {
    render(await DashboardPage());
    expect(screen.getByRole("heading", { name: "Hello, Alex." })).toBeInTheDocument();
    for (const slug of ["math", "reading", "science", "french"]) {
      expect(screen.getByRole("link", { name: new RegExp(slug, "i") })).toHaveAttribute("href", `/learn/${slug}`);
    }
    expect(screen.queryByRole("heading", { name: "Spelling Bee" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore all games" })).toHaveAttribute("href", "/learn/games");
  });

  it("lists every game with its subject play link in the separate Games directory", async () => {
    render(await GamesPage());
    expect(screen.getByRole("heading", { level: 1, name: "Games" })).toBeInTheDocument();
    const expected = [
      ["Math Army", "math", "math-army"], ["Math Kart", "math", "math-kart"],
      ["Code Commander", "math", "code-commander"], ["Fraction Factory", "math", "fraction-factory"],
      ["Spelling Snake", "reading", "spelling-snake"], ["Typing Ninja", "reading", "typing-ninja"],
      ["Ecosystem Island", "science", "ecosystem-island"], ["Time Traveler", "science", "time-traveler"],
      ["Map Quest", "science", "map-quest"], ["Planet Hopper", "science", "planet-hopper"],
    ];
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(expected.length);
    for (const [name, subject, slug] of expected) {
      expect(screen.getByRole("heading", { name }).closest("a")).toHaveAttribute("href", `/learn/${subject}/${slug}`);
    }
  });

  it("requires sign-in before showing the Games directory", async () => {
    mocks.requireUser.mockRejectedValueOnce(new Error("login-required"));
    await expect(GamesPage()).rejects.toThrow("login-required");
  });

  it("links all French lessons and renders exactly ten study images", async () => {
    const { unmount } = render(await LessonPage({ params: Promise.resolve({ subject: "french", lesson: "practice" }) }));
    expect(screen.getByRole("link", { name: /les animaux/i })).toHaveAttribute("href", "/learn/french/practice/animals");
    expect(screen.getByRole("link", { name: /food/i })).toHaveAttribute("href", "/learn/french/practice/food");
    expect(screen.getByRole("link", { name: /everyday objects/i })).toHaveAttribute("href", "/learn/french/practice/everyday-objects");
    expect(screen.getByRole("link", { name: /Dans ma salle de classe/ })).toHaveAttribute("href", "/learn/french/practice/classroom");
    unmount();
    render(await CoursePage({ params: Promise.resolve({ subject: "french", lesson: "practice", course: "animals" }) }));
    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(screen.getAllByRole("button", { name: /^Listen to/ })).toHaveLength(10);
  });

  it("puts Mental Mathematics above Math grades and links all four activity sections", async () => {
    const { unmount } = render(await SubjectPage({ params: Promise.resolve({ subject: "math" }) }));
    const link = screen.getByRole("link", { name: "Explore Mental Mathematics" });
    expect(link).toHaveAttribute("href", "/learn/math/mental-mathematics");
    expect(link.compareDocumentPosition(screen.getByRole("heading", { name: "Choose your grade" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    unmount();
    render(await LessonPage({ params: Promise.resolve({ subject: "math", lesson: "mental-mathematics" }) }));
    for (const activity of mentalMathActivities) {
      expect(screen.getByRole("link", { name: new RegExp(activity.title) })).toHaveAttribute("href", `/learn/math/mental-mathematics/${activity.slug}`);
    }
  });

  it.each(mentalMathActivities)("opens the protected $title timed quiz", async (activity) => {
    render(await CoursePage({ params: Promise.resolve({ subject: "math", lesson: "mental-mathematics", course: activity.slug }) }));
    expect(screen.getByRole("heading", { level: 1, name: activity.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start five-minute quiz" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Mental Mathematics" })).toHaveAttribute("href", "/learn/math/mental-mathematics");
  });

  it("rejects unknown mental math activities and gates new pages behind sign-in", async () => {
    await expect(CoursePage({ params: Promise.resolve({ subject: "math", lesson: "mental-mathematics", course: "missing" }) })).rejects.toThrow("not-found");
    mocks.requireUser.mockRejectedValue(new Error("login-required"));
    await expect(LessonPage({ params: Promise.resolve({ subject: "math", lesson: "mental-mathematics" }) })).rejects.toThrow("login-required");
    await expect(CoursePage({ params: Promise.resolve({ subject: "math", lesson: "mental-mathematics", course: "single-digit-addition" }) })).rejects.toThrow("login-required");
  });

  it("renders the 24-word classroom list in all-grades practice", async () => {
    render(await CoursePage({ params: Promise.resolve({ subject: "french", lesson: "practice", course: "classroom" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Dans ma salle de classe..." })).toBeInTheDocument();
    expect(document.querySelectorAll(".french-study-grid [role=img]")).toHaveLength(24);
    expect(screen.getAllByRole("button", { name: /^Listen to/ })).toHaveLength(24);
    expect(screen.getByText("des élèves")).toHaveAttribute("lang", "fr");
    expect(screen.queryByRole("link", { name: /Start end-of-lesson quiz/ })).not.toBeInTheDocument();
  });

  it("links a subject to its lesson and offers its quiz on a separate page", async () => {
    const subjectPage = await LessonPage({ params: Promise.resolve({ subject: "math", lesson: "practice" }) });
    const { unmount } = render(subjectPage);
    expect(screen.getByRole("link", { name: /fraction detectives/i })).toHaveAttribute("href", "/learn/math/practice/fraction-detectives");
    unmount();
    render(await CoursePage({ params: Promise.resolve({ subject: "math", lesson: "practice", course: "fraction-detectives" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Fraction detectives" })).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start end-of-lesson quiz/ })).toHaveAttribute("href", "/learn/math/practice/fraction-detectives/quiz");
  });

  it("puts Vocabulary before grades 1–8 and redirects the old spelling practice link", async () => {
    const { unmount } = render(await SubjectPage({ params: Promise.resolve({ subject: "reading" }) }));
    for (let grade = 1; grade <= 8; grade++) {
      expect(screen.getByRole("link", { name: new RegExp(`Grade ${grade} `) })).toHaveAttribute("href", `/learn/reading/grade-${grade}`);
    }
    const vocabulary = screen.getByRole("link", { name: /Explore vocabulary/i });
    expect(vocabulary).toHaveAttribute("href", "/learn/reading/vocabulary");
    expect(vocabulary.compareDocumentPosition(screen.getByRole("heading", { name: "Choose your grade" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("link", { name: /all-grades practice/i })).toHaveAttribute("href", "/learn/reading/practice");
    unmount();
    await expect(LessonPage({ params: Promise.resolve({ subject: "spelling", lesson: "practice" }) })).rejects.toThrow("redirect:/learn/reading/vocabulary");
  });

  it("offers numbered vocabulary lessons with independent study and quiz links", async () => {
    render(await LessonPage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary" }) }));
    for (let number = 1; number <= 3; number++) {
      expect(screen.getByRole("link", { name: `Study Lesson ${number}` })).toHaveAttribute("href", `/learn/reading/vocabulary/test-${number}`);
      expect(screen.getByRole("link", { name: `Take Lesson ${number} quiz` })).toHaveAttribute("href", `/learn/reading/vocabulary/test-${number}/quiz`);
    }
    expect(screen.getByRole("link", { name: "Create a custom quiz" })).toHaveAttribute("href", "/learn/reading/vocabulary/custom/quiz");
  });

  it("redirects previous spelling routes to their matching Language & Reading pages", async () => {
    await expect(SubjectPage({ params: Promise.resolve({ subject: "spelling" }) })).rejects.toThrow("redirect:/learn/reading");
    for (const lesson of ["vocabulary", "grade-4", "grade-8"]) {
      await expect(LessonPage({ params: Promise.resolve({ subject: "spelling", lesson }) })).rejects.toThrow(`redirect:/learn/reading/${lesson}`);
    }
    const course = getGradeCourses("spelling", 4)[0];
    for (const [lesson, slug] of [["vocabulary", "test-1"], ["grade-4", course.slug]]) {
      await expect(CoursePage({ params: Promise.resolve({ subject: "spelling", lesson, course: slug }) })).rejects.toThrow(`redirect:/learn/reading/${lesson}/${slug}`);
      await expect(LessonQuizPage({ params: Promise.resolve({ subject: "spelling", lesson, course: slug }) })).rejects.toThrow(`redirect:/learn/reading/${lesson}/${slug}/quiz`);
    }
  });

  it("includes the spelling support unit in the Language & Reading Grade 4 catalog", async () => {
    render(await LessonPage({ params: Promise.resolve({ subject: "reading", lesson: "grade-4" }) }));
    expect(screen.getByText(/59 specific expectations/)).toBeInTheDocument();
    for (const course of getGradeCourses("spelling", 4)) {
      const heading = screen.getByRole("heading", { level: 3, name: course.title });
      expect(heading.closest("a")).toHaveAttribute("href", `/learn/reading/grade-4/${course.slug}`);
    }
  });

  it.each([1, 2, 3])("renders all definitions and examples for vocabulary lesson %i before its quiz", async (number) => {
    render(await CoursePage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary", course: `test-${number}` }) }));
    const count = number === 3 ? 17 : 15;
    expect(screen.getAllByText("Definition:")).toHaveLength(count);
    expect(screen.getAllByText("Example sentence:")).toHaveLength(count);
    expect(screen.getAllByRole("button", { name: /^Hear pronunciation:/ })).toHaveLength(count);
    expect(screen.queryByLabelText("Spell the word")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Start Lesson ${number} quiz` })).toHaveAttribute("href", `/learn/reading/vocabulary/test-${number}/quiz`);
  });

  it("opens the requested vocabulary quiz without a list chooser and preserves custom input", async () => {
    const { unmount } = render(await LessonQuizPage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary", course: "test-2" }) }));
    expect(screen.getByRole("heading", { name: "Lesson 2 — quiz" })).toBeInTheDocument();
    expect(screen.getByText(/15 spelling words/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Word list")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Study Lesson 2" })).toHaveAttribute("href", "/learn/reading/vocabulary/test-2");
    unmount();
    render(await LessonQuizPage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary", course: "custom" }) }));
    expect(screen.getByLabelText("Your words")).toBeInTheDocument();
    await expect(CoursePage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary", course: "test-4" }) })).rejects.toThrow("not-found");
    await expect(LessonQuizPage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary", course: "test-4" }) })).rejects.toThrow("not-found");
  });

  it("opens Lesson 3's complete 17-word spelling and meaning quiz directly", async () => {
    render(await LessonQuizPage({ params: Promise.resolve({ subject: "reading", lesson: "vocabulary", course: "test-3" }) }));
    expect(screen.getByRole("heading", { name: "Lesson 3 — quiz" })).toBeInTheDocument();
    expect(screen.getByText(/17 spelling words/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Study Lesson 3" })).toHaveAttribute("href", "/learn/reading/vocabulary/test-3");
    expect(screen.queryByLabelText("Word list")).not.toBeInTheDocument();
  });

  it("redirects old lesson URLs, publishes Grade 8 and rejects invalid grades", async () => {
    await expect(LessonPage({ params: Promise.resolve({ subject: "math", lesson: "fraction-detectives" }) })).rejects.toThrow("redirect:/learn/math/practice/fraction-detectives");
    render(await LessonPage({ params: Promise.resolve({ subject: "math", lesson: "grade-8" }) }));
    expect(screen.getByRole("heading", { name: "Math — Grade 8" })).toBeInTheDocument();
    expect(screen.queryByText(/no published lessons/)).not.toBeInTheDocument();
    for (const course of getGradeCourses("math", 8)) {
      expect(screen.getByRole("heading", { name: course.title, level: 3 }).closest("a")).toHaveAttribute("href", `/learn/math/grade-8/${course.slug}`);
    }
    await expect(CoursePage({ params: Promise.resolve({ subject: "math", lesson: "grade-9", course: "anything" }) })).rejects.toThrow("not-found");
  });

  it("checks sign-in on every learning page before returning content", async () => {
    mocks.requireUser.mockRejectedValue(new Error("login-required"));
    await expect(DashboardPage()).rejects.toThrow("login-required");
    await expect(SubjectPage({ params: Promise.resolve({ subject: "math" }) })).rejects.toThrow("login-required");
    await expect(LessonPage({ params: Promise.resolve({ subject: "math", lesson: "fraction-detectives" }) })).rejects.toThrow("login-required");
    await expect(CoursePage({ params: Promise.resolve({ subject: "math", lesson: "grade-4", course: "number-builders" }) })).rejects.toThrow("login-required");
    await expect(LessonQuizPage({ params: Promise.resolve({ subject: "math", lesson: "grade-4", course: "number-builders" }) })).rejects.toThrow("login-required");
  });

  it("links Grade 4 coverage to actual sections and renders graded French with both quiz types", async () => {
    const { unmount } = render(await LessonPage({ params: Promise.resolve({ subject: "math", lesson: "grade-4" }) }));
    expect(screen.getByRole("heading", { name: "Math — Grade 4" })).toBeInTheDocument();
    expect(screen.getByText(/48 specific expectations/)).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", { name: /Place value to ten thousand: Place value/ })) {
      expect(link).toHaveAttribute("href", "/learn/math/grade-4/number-builders-place-value#section-0");
    }
    unmount();
    const course = getGradeCourses("french", 4)[0];
    render(await CoursePage({ params: Promise.resolve({ subject: "french", lesson: "grade-4", course: course.slug }) }));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("region", { name: "Section practice" })).toHaveLength(course.sections.length);
    expect(screen.queryByRole("region", { name: "End-of-lesson quiz" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start end-of-lesson quiz/ })).toHaveAttribute("href", `/learn/french/grade-4/${course.slug}/quiz`);
    expect(screen.getAllByRole("button", { name: /^Read section:/ })).toHaveLength(course.sections.length);
    expect(document.querySelectorAll(".french-study-grid [role=img]")).toHaveLength(10);
    expect(screen.getAllByRole("button", { name: /^Listen to/ })).toHaveLength(10);
  });

  it("renders a stand-alone quiz with a return link and no lesson practice or audio", async () => {
    const course = getGradeCourses("math", 4)[0];
    const { unmount } = render(await LessonQuizPage({ params: Promise.resolve({ subject: "math", lesson: "grade-4", course: course.slug }) }));
    expect(screen.getByRole("heading", { level: 1, name: `${course.title} — quiz` })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to lesson" })).toHaveAttribute("href", `/learn/math/grade-4/${course.slug}`);
    expect(screen.getByRole("region", { name: "End-of-lesson quiz" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Section practice" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Read section:/ })).not.toBeInTheDocument();
    expect(screen.getByText("Question 1 of 6")).toBeInTheDocument();
    unmount();
    render(await LessonQuizPage({ params: Promise.resolve({ subject: "math", lesson: "practice", course: "fraction-detectives" }) }));
    expect(screen.getByRole("link", { name: "Back to lesson" })).toHaveAttribute("href", "/learn/math/practice/fraction-detectives");
    expect(screen.getByText("Question 1 of 5")).toBeInTheDocument();
  });

  it("groups deeper lessons into units and keeps older course and quiz URLs useful", async () => {
    const { unmount } = render(await CoursePage({ params: Promise.resolve({ subject: "science", lesson: "grade-4", course: "habitat-investigators" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Habitat investigators" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /A habitat is more than a home/ })).toHaveAttribute("href", "/learn/science/grade-4/habitat-investigators-habitats");
    expect(screen.getByRole("link", { name: /Energy links/ })).toHaveAttribute("href", "/learn/science/grade-4/habitat-investigators-food-webs");
    expect(screen.getByRole("link", { name: /Decisions that protect/ })).toHaveAttribute("href", "/learn/science/grade-4/habitat-investigators-habitat-protection");
    expect(screen.queryByRole("region", { name: "Section practice" })).not.toBeInTheDocument();
    unmount();
    const quiz = render(await LessonQuizPage({ params: Promise.resolve({ subject: "science", lesson: "grade-4", course: "habitat-investigators" }) }));
    expect(screen.getByText(/previous combined unit quiz, preserved/)).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 6")).toBeInTheDocument();
    quiz.unmount();
    render(await CoursePage({ params: Promise.resolve({ subject: "french", lesson: "grade-4", course: "bonjour-les-animaux-conversation" }) }));
    expect(screen.getByRole("navigation", { name: "Unit lessons" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /vocabulary cards and matching/ })).toHaveAttribute("href", "/learn/french/grade-4/bonjour-les-animaux-listening");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "Section practice" })).toHaveLength(3);
  });

  it("rejects unknown quiz routes, unpublished grades, and matching-only practice lessons", async () => {
    for (const slugs of [
      { subject: "unknown", lesson: "grade-4", course: "number-builders" },
      { subject: "math", lesson: "grade-5", course: "number-builders" },
      { subject: "math", lesson: "grade-9", course: "number-builders" },
      { subject: "math", lesson: "grade-4", course: "missing" },
      { subject: "math", lesson: "anything", course: "fraction-detectives" },
      { subject: "french", lesson: "practice", course: "animals" },
    ]) {
      await expect(LessonQuizPage({ params: Promise.resolve(slugs) })).rejects.toThrow("not-found");
    }
  });

  it("returns not-found for unknown subjects and lessons", async () => {
    await expect(SubjectPage({ params: Promise.resolve({ subject: "unknown" }) })).rejects.toThrow("not-found");
    await expect(LessonPage({ params: Promise.resolve({ subject: "math", lesson: "unknown" }) })).rejects.toThrow("not-found");
  });
});
