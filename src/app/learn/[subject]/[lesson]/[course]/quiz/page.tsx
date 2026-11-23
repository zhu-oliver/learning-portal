import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getLesson, getSubject } from "@/modules";
import { getGradeCourse, getGradeUnit, parseGrade, parseImmersionGrade } from "@/modules/curriculum";
import { Quiz } from "@/components/quiz";
import { SpellingBee } from "@/components/spelling-bee";
import { getSpellingList, spellingLists } from "@/modules/spelling";
import { getLessonActivities } from "@/modules/activities";

export const metadata = { title: "End-of-lesson quiz" };

export default async function LessonQuizPage({ params }: { params: Promise<{ subject: string; lesson: string; course: string }> }) {
  await requireUser();
  const slugs = await params;
  if (slugs.subject === "spelling") redirect(`/learn/reading/${slugs.lesson}/${slugs.course}/quiz`);
  const subject = getSubject(slugs.subject);
  const immersionGrade = parseImmersionGrade(slugs.lesson);
  if (subject?.slug === "french" && immersionGrade) {
    const lesson = getGradeCourse("french", immersionGrade, slugs.course, "immersion");
    if (!lesson) notFound();
    const problems = getLessonActivities("french", lesson)?.final;
    return <div className="lesson theme-french" lang="fr">
      <Link className="back-link" href={`/learn/french/${slugs.lesson}/${lesson.slug}`}><ArrowLeft size={17} /> Retour à la leçon</Link>
      <header className="lesson-heading"><span className="eyebrow">IMMERSION FRANÇAISE · {immersionGrade === 1 ? "1re" : `${immersionGrade}e`} ANNÉE</span><h1>{lesson.title} — quiz</h1>
        <p>{lesson.questions.length + (problems?.length ?? 0)} questions variées, différentes de la pratique. Seul le résultat final est enregistré. Revenir à la leçon ou quitter cette page recommence un quiz non terminé.</p>
      </header>
      <Quiz key={lesson.slug} questions={lesson.questions} problems={problems} title="Quiz de la leçon" language="fr"
        activity={{ subject: "french", grade: immersionGrade, program: "immersion", lesson: lesson.slug }} />
    </div>;
  }
  if (subject?.slug === "reading" && slugs.lesson === "vocabulary") {
    const list = getSpellingList(slugs.course);
    if (!list && slugs.course !== "custom") notFound();
    return <>
      <Link className="back-link" href="/learn/reading/vocabulary"><ArrowLeft size={17} /> Back to Vocabulary</Link>
      {list && <p><Link href={`/learn/reading/vocabulary/${list.id}`}>Study Lesson {spellingLists.indexOf(list) + 1}</Link></p>}
      <SpellingBee key={slugs.course} saveResults initialListId={slugs.course}
        quizTitle={list ? `Lesson ${spellingLists.indexOf(list) + 1} — quiz` : "Custom spelling quiz"} />
    </>;
  }
  const grade = parseGrade(slugs.lesson);
  const lesson = grade ? getGradeCourse(slugs.subject, grade, slugs.course) :
    slugs.lesson === "practice" ? getLesson(slugs.subject, slugs.course) : undefined;
  if (!subject || !lesson || !lesson.questions.length) notFound();
  const legacyUnit = grade && getGradeUnit(subject.slug, grade, lesson.slug);
  const problems = getLessonActivities(subject.slug, lesson)?.final;
  return <div className={`lesson theme-${subject.theme}`}>
    <Link className="back-link" href={`/learn/${subject.slug}/${slugs.lesson}/${lesson.slug}`}><ArrowLeft size={17} /> Back to lesson</Link>
    <header className="lesson-heading">
      <span className="eyebrow">{subject.title} · {grade ? `Grade ${grade}` : "All-grades practice"}</span>
      <h1>{lesson.title} — quiz</h1>
      {legacyUnit && <p className="small-note">This is the previous combined unit quiz, preserved for older links and attempts. New topic quizzes are available from the unit overview.</p>}
      <p>{lesson.questions.length + (problems?.length ?? 0)} questions{problems?.length ? " with a mix of multiple-choice and interactive formats" : ""}{grade ? " covering every section, different from the section practice" : " covering this lesson"}.
        Your completed quiz is saved to private history. Practice scores are not included.</p>
      <p className="small-note">Unfinished answers are not saved. Returning to the lesson or leaving this page restarts an unfinished quiz.</p>
    </header>
    <Quiz key={`${subject.slug}/${slugs.lesson}/${lesson.slug}`} title="End-of-lesson quiz" questions={lesson.questions} problems={problems}
      activity={{ subject: subject.slug, lesson: lesson.slug, ...(grade ? { grade } : {}) }} />
  </div>;
}
