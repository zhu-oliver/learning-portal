import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLesson, getSubject } from "@/modules";
import { requireUser } from "@/lib/session";
import { getGradeCourses, getGradeUnits, parseGrade, parseImmersionGrade } from "@/modules/curriculum";
import { spellingLists } from "@/modules/spelling";
import { CurriculumCoverage } from "@/components/curriculum-coverage";
import { mentalMathActivities } from "@/modules/mental-math";

export default async function LessonPage({ params }: { params: Promise<{ subject: string; lesson: string }> }) {
  await requireUser();
  const slugs = await params;
  if (slugs.subject === "spelling") redirect(`/learn/reading/${slugs.lesson === "practice" ? "vocabulary" : slugs.lesson}`);
  const subject = getSubject(slugs.subject);
  if (!subject) notFound();
  const immersionGrade = parseImmersionGrade(slugs.lesson);
  if (subject.slug === "french" && immersionGrade) {
    const lessons = getGradeCourses("french", immersionGrade, "immersion");
    const expectationIds = [...new Set(lessons.flatMap((lesson) => lesson.expectations ?? []))].sort();
    return <>
      <Link className="back-link" href="/learn/french?program=immersion"><ArrowLeft size={17} /> French Immersion — grades</Link>
      <h1>French Immersion — Grade {immersionGrade}</h1>
      <p className="history-intro">French-language learning for immersion students, mainly in French with optional English help. This does not cover the other subjects taught in French Immersion.</p>
      {!lessons.length && <p className="empty-history">This immersion grade has no published lessons. No curriculum coverage is claimed.</p>}
      {lessons.length > 0 && <>
        <p>{lessons.length} lessons introduce and practise listening, speaking, reading and writing. Adult-led performance activities and selected local resources are required; quizzes alone do not assess curriculum mastery.</p>
        {immersionGrade === 2 ? <>
        <p><a href={lessons[0].source} target="_blank" rel="noreferrer">Official Ontario curriculum, French Immersion Grade 2 (2013), printed pages 215–227</a></p>
        <details><summary>Curriculum learning map — {expectationIds.length} specific expectations</summary>
          <ul>{expectationIds.map((id) => <li key={id}>{id}: {lessons.flatMap((lesson) => lesson.sections.flatMap((section, index) => section.expectations?.includes(id) ? [
            <Link key={`${lesson.slug}-${index}`} href={`/learn/french/${slugs.lesson}/${lesson.slug}#section-${index}`}>{lesson.title} — {section.heading}</Link>,
          ] : [])).map((link, index) => <span key={index}>{index > 0 ? " · " : ""}{link}</span>)}</li>)}</ul>
        </details>
        </> : <CurriculumCoverage subject="french" grade={immersionGrade} program="immersion" />}
        <div className="lesson-list">{lessons.map((lesson) => <Link key={lesson.slug} className="lesson-card" href={`/learn/french/${slugs.lesson}/${lesson.slug}`}>
          <div lang="fr"><span className="eyebrow">{lesson.strand}</span><h2>{lesson.title}</h2><p>{lesson.introduction}</p></div><ArrowRight size={22} />
        </Link>)}</div>
      </>}
    </>;
  }
  if (subject.slug === "math" && slugs.lesson === "mental-mathematics") return <>
    <Link className="back-link" href="/learn/math"><ArrowLeft size={17} /> Back to Math</Link>
    <h1>Mental Mathematics</h1>
    <p className="history-intro">Choose an addition or multiplication quiz. Each new quiz has 8 random side numbers and 5 random top numbers, making 40 answers. Work down one column at a time within five minutes. Submit early or let the timer submit automatically. Your score and time taken are saved to private history.</p>
    <div className="lesson-list">{mentalMathActivities.map((activity) => <Link key={activity.slug} className="lesson-card" href={`/learn/math/mental-mathematics/${activity.slug}`}>
      <div><h2>{activity.title}</h2><p>40 answers · 5 minutes · new numbers each time</p></div><ArrowRight size={22} />
    </Link>)}</div>
  </>;
  if (subject.slug === "reading" && slugs.lesson === "vocabulary") return <>
    <Link className="back-link" href="/learn/reading"><ArrowLeft size={17} /> Back to Language &amp; Reading</Link>
    <h1>Vocabulary</h1>
    <p className="history-intro">Study each lesson&apos;s definitions and example sentences before its spelling and meaning quiz, or jump straight to the quiz. These lessons are available to every grade.</p>
    <div className="lesson-list">{spellingLists.map((list, index) => <section className="lesson-card" key={list.id}>
      <div><h2>Lesson {index + 1}</h2><p>{list.description} · {list.words.length} words</p>
        <div className="bee-actions">
          <Link className="button primary" href={`/learn/reading/vocabulary/${list.id}`}>Study Lesson {index + 1}</Link>
          <Link className="button secondary" href={`/learn/reading/vocabulary/${list.id}/quiz`}>Take Lesson {index + 1} quiz</Link>
        </div>
      </div>
    </section>)}</div>
    <section className="lesson-final-quiz"><h2>Custom word list</h2><p>Enter your own words for a spelling-only quiz. Custom lists do not include prepared definitions or meaning questions.</p>
      <Link className="button secondary" href="/learn/reading/vocabulary/custom/quiz">Create a custom quiz</Link>
    </section>
  </>;
  const grade = parseGrade(slugs.lesson);
  if (!grade && slugs.lesson !== "practice") {
    if (getLesson(slugs.subject, slugs.lesson)) redirect(`/learn/${subject.slug}/practice/${slugs.lesson}`);
    notFound();
  }
  const courses = grade ? getGradeCourses(subject.slug, grade) : subject.lessons;
  const units = grade ? getGradeUnits(subject.slug, grade) : [];
  const groups = grade ? units.length ? units.map((unit) => ({
    title: unit.title, slug: unit.slug, linked: true, courses: courses.filter((course) => course.unitSlug === unit.slug),
  })) : [...new Set(courses.map((course) => course.unitSlug ?? course.strand ?? "topics"))].map((slug) => {
    const topics = courses.filter((course) => (course.unitSlug ?? course.strand ?? "topics") === slug);
    return { title: topics[0].unitTitle ?? topics[0].strand ?? "Topic lessons", slug, linked: false, courses: topics };
  }) : [{ title: "Practice lessons", slug: "practice", linked: false, courses }];
  return <>
    <Link className="back-link" href={`/learn/${subject.slug}`}><ArrowLeft size={17} /> Back to {subject.title} grades</Link>
    <h1>{subject.title} — {grade ? `Grade ${grade}` : "All-grades practice"}</h1>
    {grade && <p className="history-intro">{subject.slug === "french" && grade < 4 ? "Optional French enrichment. Ontario Core French begins in Grade 4." : subject.slug === "spelling" ? "Spelling and vocabulary support Ontario Language; Spelling Bee is not a separate provincial curriculum." : "Each topic is a separate, deeper lesson with unsaved practice, guided activities, read-aloud, and its own final quiz. Quiz scores do not certify curriculum mastery."}</p>}
    {!courses.length && <p className="empty-history">{subject.slug === "french" && grade && grade < 4 ? "Ontario Core French begins in Grade 4. Use the shared vocabulary practice for optional enrichment, or choose French Immersion for its Grade 1–8 language lessons." : "This grade has no published lessons. No curriculum coverage is claimed. Try the all-grades practice area."}</p>}
    {subject.slug === "french" && grade && grade < 4 && <p>
      <Link href="/learn/french/practice">Explore shared French vocabulary</Link>
      {" · "}<Link href={`/learn/french/immersion-grade-${grade}`}>French Immersion — Grade {grade}</Link>
    </p>}
    {grade && courses.length > 0 && <CurriculumCoverage subject={subject.slug} grade={grade} />}
    {groups.map((group) => <section key={group.slug} aria-label={group.title}>
      {grade && <h2>{group.linked ? <Link href={`/learn/${subject.slug}/${slugs.lesson}/${group.slug}`}>{group.title}</Link> : group.title}</h2>}
      <div className="lesson-list">{group.courses.map((course) => <Link key={course.slug} className="lesson-card" href={`/learn/${subject.slug}/${slugs.lesson}/${course.slug}`}>
      <div><span className="eyebrow">{course.strand}</span>{grade ? <h3>{course.title}</h3> : <h2>{course.title}</h2>}<p>{course.introduction}</p>
        {course.expectations && <p>Curriculum focus: {course.expectations.join(", ")}</p>}
      </div><ArrowRight size={22} />
    </Link>)}</div></section>)}
  </>;
}
