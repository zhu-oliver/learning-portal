import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSubject } from "@/modules";
import { requireUser } from "@/lib/session";
import { SubjectIcon } from "@/components/subject-icon";
import { grades, getGradeCourses } from "@/modules/curriculum";
import { FrenchPrograms } from "@/components/french-programs";

export default async function SubjectPage({ params, searchParams }: { params: Promise<{ subject: string }>; searchParams?: Promise<{ program?: string }> }) {
  await requireUser();
  const { subject: slug } = await params;
  if (slug === "spelling") redirect("/learn/reading");
  const subject = getSubject(slug);
  if (!subject) notFound();
  const program = (await searchParams)?.program;
  if (program !== undefined && program !== "core" && program !== "immersion") notFound();
  if (subject.slug === "french") return <div className="subject-page theme-french">
    <Link className="back-link" href="/learn"><ArrowLeft size={17} /> All subjects</Link>
    <header className="subject-heading"><span className="subject-icon"><SubjectIcon theme="french" size={38} /></span><div><div className="eyebrow">{subject.tagline}</div><h1>French</h1><p>Choose Core French or French Immersion, then your grade. Both programs can use our shared vocabulary practice.</p></div></header>
    <FrenchPrograms initialProgram={program === "immersion" ? "immersion" : "core"}
      gradeOptions={grades.map((grade) => ({ grade, core: getGradeCourses("french", grade).length, immersion: getGradeCourses("french", grade, "immersion").length }))} />
  </div>;
  return <div className={`subject-page theme-${subject.theme}`}>
    <Link className="back-link" href="/learn"><ArrowLeft size={17} /> All subjects</Link>
    <header className="subject-heading"><span className="subject-icon"><SubjectIcon theme={subject.theme} size={38} /></span><div><div className="eyebrow">{subject.tagline}</div><h1>{subject.title}</h1><p>{subject.description}</p></div></header>
    {subject.slug === "reading" && <section className="lesson-final-quiz">
      <h2>Vocabulary</h2>
      <p>Learn word definitions and example sentences, then take a Spelling Bee spelling and meaning quiz. You can also go straight to a quiz.</p>
      <Link className="button primary" href="/learn/reading/vocabulary">Explore vocabulary <ArrowRight size={18} /></Link>
    </section>}
    {subject.slug === "reading" && <section className="lesson-final-quiz">
      <h2>English games</h2>
      <p>Spelling Snake: listen to a word, then steer your snake to collect its letters in order. Seven levels cover short words, sight words, sound teams, magic E, and trickier spellings.</p>
      <Link className="button primary" href="/learn/reading/spelling-snake">Play Spelling Snake <ArrowRight size={18} /></Link>
    </section>}
    {subject.slug === "math" && <section className="lesson-final-quiz">
      <h2>Mental Mathematics</h2>
      <p>Try a random 40-answer addition or multiplication table. You have five minutes, and your score and time taken are saved.</p>
      <Link className="button primary" href="/learn/math/mental-mathematics">Explore Mental Mathematics <ArrowRight size={18} /></Link>
    </section>}
    {subject.slug === "math" && <section className="lesson-final-quiz">
      <h2>Math games</h2>
      <p>Play Math Army: steer through the correct answers to practise addition, subtraction, multiplication, division, and multi-step maths across eight levels.</p>
      <Link className="button primary" href="/learn/math/math-army">Play Math Army <ArrowRight size={18} /></Link>
      <p>Math Kart: race through the correct answers for turbo boosts across eight tracks, solo or in two-player split screen on the same device.</p>
      <Link className="button primary" href="/learn/math/math-kart">Play Math Kart <ArrowRight size={18} /></Link>
      <p>Code Commander: build a program to guide your tank to the flag. Practise sequences, loops, nested loops, and conditions across 25 coding missions.</p>
      <Link className="button primary" href="/learn/math/code-commander">Play Code Commander <ArrowRight size={18} /></Link>
    </section>}
    <h2 className="lessons-title">Choose your grade</h2>
    <p className="history-intro">Ontario curriculum learning for Grades 1–8. Choose a grade to explore its topic lessons, guided activities, practice and separate mixed-format quizzes.</p>
    <div className="grade-grid">{grades.map((grade) =>
      <Link className="lesson-card" href={`/learn/${subject.slug}/grade-${grade}`} key={grade}>
        <div><h3>Grade {grade}</h3><p>{getGradeCourses(subject.slug, grade).length ? `${getGradeCourses(subject.slug, grade).length} curriculum lessons` : "Coming later — no lessons published yet"}</p>
          {subject.slug === "french" && grade < 4 && <p>Optional enrichment, not Ontario Core French requirements.</p>}
        </div><ArrowRight size={20} />
      </Link>,
    )}</div>
    {subject.activity !== "spelling" && <Link className="button secondary" href={`/learn/${subject.slug}/practice`}>All-grades practice — original starter lessons</Link>}
  </div>;
}
