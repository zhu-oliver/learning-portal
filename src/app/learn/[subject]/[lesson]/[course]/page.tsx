import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getLesson, getSubject } from "@/modules";
import { getGradeCourse, getGradeCourses, getGradeUnit, parseGrade, parseImmersionGrade } from "@/modules/curriculum";
import { LessonContent } from "@/components/lesson-content";
import { FrenchLesson } from "@/components/french-lesson";
import { getSpellingList, spellingLists } from "@/modules/spelling";
import { getMentalMathActivity } from "@/modules/mental-math";
import { MentalMathQuiz } from "@/components/mental-math-quiz";
import { isImmersionLesson } from "@/modules/french-immersion";
import { ImmersionLesson } from "@/components/immersion-lesson";
import { getLessonActivities } from "@/modules/activities";
import { vocabularyPractice } from "@/modules/activities/vocabulary";
import { ProblemPractice } from "@/components/problems/problem-practice";
import { SectionAudio } from "@/components/section-audio";

export default async function CoursePage({ params }: { params: Promise<{ subject: string; lesson: string; course: string }> }) {
  await requireUser();
  const slugs = await params;
  if (slugs.subject === "spelling") redirect(`/learn/reading/${slugs.lesson}/${slugs.course}`);
  const subject = getSubject(slugs.subject);
  const immersionGrade = parseImmersionGrade(slugs.lesson);
  if (subject?.slug === "french" && immersionGrade) {
    const lesson = getGradeCourse("french", immersionGrade, slugs.course, "immersion");
    if (!lesson || !isImmersionLesson(lesson)) notFound();
    return <>
      <Link className="back-link" href={`/learn/french/${slugs.lesson}`}><ArrowLeft size={17} /> French Immersion — Grade {immersionGrade}</Link>
      <ImmersionLesson lesson={lesson} />
      <section className="lesson-final-quiz" lang="fr"><h2>Prêt pour le quiz ?</h2>
        <p>Un quiz varié avec des questions de chaque section. La pratique ne compte pas dans le résultat final.</p>
        <Link className="button primary" href={`/learn/french/${slugs.lesson}/${lesson.slug}/quiz`}>Commencer le quiz <ArrowRight size={18} /></Link>
      </section>
    </>;
  }
  if (subject?.slug === "math" && slugs.lesson === "mental-mathematics") {
    const activity = getMentalMathActivity(slugs.course);
    if (!activity) notFound();
    return <>
      <Link className="back-link" href="/learn/math/mental-mathematics"><ArrowLeft size={17} /> Back to Mental Mathematics</Link>
      <MentalMathQuiz key={activity.slug} activity={activity} />
    </>;
  }
  if (subject?.slug === "reading" && slugs.lesson === "vocabulary") {
    const list = getSpellingList(slugs.course);
    if (!list) notFound();
    const title = `Lesson ${spellingLists.indexOf(list) + 1}`;
    return <article className="lesson theme-spelling">
      <Link className="back-link" href="/learn/reading/vocabulary"><ArrowLeft size={17} /> Back to Vocabulary</Link>
      <header className="lesson-heading"><span className="eyebrow">VOCABULARY</span><h1>{title} — {list.description}</h1><p>Read each definition and example sentence. Hear each word, then try using it in a sentence of your own.</p>
        <p className="small-note">Pronunciation uses an English browser/device voice, which may process spoken text remotely. No microphone is used.</p>
      </header>
      <div className="lesson-sections">{list.vocabulary.map((entry, index) => <section className="lesson-section" key={entry.id}><div>
        <h2>{index + 1}. {list.words[index]}</h2>
        <SectionAudio heading={list.words[index]} body="" pronunciation />
        <p><strong>Definition:</strong> {entry.explanation}</p>
        <p><strong>Example sentence:</strong> {list.examples[index]}</p>
      </div></section>)}</div>
      <ProblemPractice problems={vocabularyPractice[list.id]} />
      <section className="lesson-final-quiz"><h2>Ready for the quiz?</h2><p>Spell all {list.words.length} words, then answer a meaning question for each word. Only completed quizzes are saved.</p>
        <Link className="button primary" href={`/learn/reading/vocabulary/${list.id}/quiz`}>Start {title} quiz <ArrowRight size={18} /></Link>
      </section>
    </article>;
  }
  const grade = parseGrade(slugs.lesson);
  const course = grade ? getGradeCourse(slugs.subject, grade, slugs.course) :
    slugs.lesson === "practice" ? getLesson(slugs.subject, slugs.course) : undefined;
  if (!subject || !course) notFound();
  const unit = grade ? getGradeUnit(subject.slug, grade, course.unitSlug ?? course.slug) : undefined;
  const topics = unit && grade ? getGradeCourses(subject.slug, grade).filter((topic) => topic.unitSlug === unit.slug) : [];
  if (unit && unit.slug === course.slug) return <>
    <Link className="back-link" href={`/learn/${subject.slug}/${slugs.lesson}`}><ArrowLeft size={17} /> Back to Grade {grade}</Link>
    <h1>{unit.title}</h1>
    <p>This unit now has {topics.length} separate, deeper lessons. Each has teaching sections, guided activities, unsaved practice, audio, and its own quiz.</p>
    <div className="lesson-list">{topics.map((topic) => <Link key={topic.slug} className="lesson-card" href={`/learn/${subject.slug}/${slugs.lesson}/${topic.slug}`}>
      <div><h2>{topic.title}</h2><p>{topic.introduction}</p></div><ArrowRight size={22} />
    </Link>)}</div>
    <p className="small-note">Older results keep their original questions. The <Link href={`/learn/${subject.slug}/${slugs.lesson}/${unit.slug}/quiz`}>previous combined unit quiz</Link> remains available for earlier links and attempts; new learning uses each topic&apos;s own quiz.</p>
  </>;
  return <>
    <Link className="back-link" href={`/learn/${subject.slug}/${slugs.lesson}`}><ArrowLeft size={17} /> {subject.title} — {grade ? `Grade ${grade}` : "Practice"}</Link>
    {unit && <nav aria-label="Unit lessons">
      <p><Link href={`/learn/${subject.slug}/${slugs.lesson}/${unit.slug}`}>{unit.title} — all topics</Link></p>
      <ul>{topics.map((topic) => <li key={topic.slug}><Link aria-current={topic.slug === course.slug ? "page" : undefined} href={`/learn/${subject.slug}/${slugs.lesson}/${topic.slug}`}>{topic.title}{topic.frenchWords ? " — vocabulary cards and matching" : ""}</Link></li>)}</ul>
    </nav>}
    {(!course.frenchWords || course.grade) && <LessonContent subject={subject} lesson={course} showQuiz={false} />}
    {course.frenchWords && <FrenchLesson lesson={course} saveResults />}
    {course.questions.length > 0 && <section className="lesson-final-quiz">
      <h2>Ready for the lesson quiz?</h2>
      <p>Take {course.questions.length + (getLessonActivities(subject.slug, course)?.final.length ?? 0)} new questions covering {grade ? "all the lesson sections" : "this lesson"} on a separate page. Section practice answers do not count toward your score.</p>
      <Link className="button primary" href={`/learn/${subject.slug}/${slugs.lesson}/${course.slug}/quiz`}>Start end-of-lesson quiz <ArrowRight size={18} /></Link>
    </section>}
  </>;
}
