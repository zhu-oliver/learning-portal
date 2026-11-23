import Link from "next/link";
import { ArrowRight, Clock, Compass, Gamepad2, History, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/session";
import { subjects } from "@/modules";
import { SubjectIcon } from "@/components/subject-icon";
import { getGradeCourses, grades } from "@/modules/curriculum";

export const metadata = { title: "Your learning space" };

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name?.trim().split(/\s+/)[0] || "Explorer";
  return <>
    <section className="dashboard-welcome">
      <div><span className="eyebrow"><Sparkles size={17} /> YOUR NEXT DISCOVERY STARTS HERE</span><h1>Hello, {firstName}<span className="brand-dot">.</span></h1><p>A fresh question. A new adventure. What will you explore today?</p></div>
      <span className="welcome-art" aria-hidden="true"><Compass size={84} strokeWidth={1} /></span>
    </section>
    <section className="discovery-banner"><div><h2>Create your own learning</h2><p>Ask your local AI for a lesson and multiple-choice quiz. Reopen your private saved lessons whenever you sign in.</p><Link className="button secondary" href="/learn/studio"><Sparkles size={17} /> Open AI Learning Studio</Link></div></section>
    <section className="discovery-banner"><span className="discovery-icon"><Gamepad2 size={26} /></span><div><h2>Games</h2><p>Find every learning game in one place, from maths and spelling adventures to world and solar-system exploration.</p><Link className="button secondary" href="/learn/games">Explore all games <ArrowRight size={17} /></Link></div></section>
    <div className="section-intro"><h2>Your subjects</h2><Link href="/learn/history" className="history-link"><History size={17} /> My result history</Link></div>
    <div className="subject-cards dashboard-cards">{subjects.map((subject) =>
      <Link href={`/learn/${subject.slug}`} className={`subject-card theme-${subject.theme}`} key={subject.slug}>
        <span className="subject-icon"><SubjectIcon theme={subject.theme} size={32} /></span>
        <span className="module-count">{subject.slug === "french" ? "Core 4–8 · Immersion 1–8" : "Grades 1–8"} · {grades.reduce((total, grade) =>
          total + getGradeCourses(subject.slug, grade).length + (subject.slug === "french" ? getGradeCourses("french", grade, "immersion").length : 0), 0)} lessons</span>
        <h3>{subject.title}</h3><p>{subject.description}</p>
        <span className="card-action">Let&apos;s explore <ArrowRight size={19} /></span>
      </Link>,
    )}</div>
    <section className="discovery-banner"><div><h3>More ways to learn</h3><p>Try word searches, picture matching, sorting, ordering, matching pairs, diagram labels, fill-in-the-blank and spelling detective activities.</p><Link className="button secondary" href="/try/activities">Explore interactive activities</Link></div></section>
    <section className="discovery-banner"><span className="discovery-icon"><Clock size={26} /></span><div><h3>Learn one section at a time.</h3><p>Choose a grade and course, try its guided activities, then check your understanding. All-grades practice keeps the original lessons; Language &amp; Reading includes Vocabulary and Spelling Bee quizzes. There&apos;s no timer and no pressure.</p></div></section>
  </>;
}
