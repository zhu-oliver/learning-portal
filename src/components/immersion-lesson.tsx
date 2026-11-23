import { SectionAudio } from "./section-audio";
import { Quiz } from "./quiz";
import type { ImmersionLesson as ImmersionLessonContent } from "@/modules/french-immersion";
import { ProblemPractice } from "./problems/problem-practice";
import { getLessonActivities } from "@/modules/activities";

export function ImmersionLesson({ lesson }: { lesson: ImmersionLessonContent }) {
  const activities = getLessonActivities("french", lesson);
  return <article className="lesson theme-french" lang="fr">
    <header className="lesson-heading"><span className="eyebrow">IMMERSION FRANÇAISE · {lesson.grade === 1 ? "1re" : `${lesson.grade}e`} ANNÉE</span>
      <h1>{lesson.title}</h1><p>{lesson.introduction}</p>
      <p>Environ {lesson.durationMinutes} minutes, à répartir en petites séances.</p>
      <p>Attentes de l&apos;Ontario : {lesson.expectations?.join(", ")}. <a href={lesson.source} target="_blank" rel="noreferrer">Programme officiel — immersion, {lesson.grade === 1 ? "1re" : `${lesson.grade}e`} année</a></p>
    </header>
    <p className="small-note">Pratique avec un adulte. Les activités d&apos;écoute, de parole, de lecture et d&apos;écriture demandent une observation réelle : le quiz ne prouve pas la maîtrise de ces compétences. Les réponses de pratique ne sont pas enregistrées.</p>
    <div className="lesson-sections">{lesson.sections.map((section, index) => <section className="lesson-section" id={`section-${index}`} key={section.heading}>
      <span className="section-number">{String(index + 1).padStart(2, "0")}</span>
      <div><div className="section-title"><h2>{section.heading}</h2>
        <SectionAudio heading={section.heading} body={section.body} activity={section.activity} language="fr" /></div>
        <p>{section.body}</p>
        <div className="guided-activity"><h3>À toi de jouer</h3><p>{section.activity}</p><p className="small-note">Un adulte observe et donne un conseil. Aucun enregistrement n&apos;est nécessaire.</p></div>
        <details className="english-help" lang="en"><summary>English help (optional)</summary><p>{section.englishHelp}</p></details>
        <p className="small-note">Attentes : {section.expectations.join(", ")}</p>
        <Quiz questions={section.questions} title="Petite pratique" practice language="fr" />
        {((section.problems?.length ?? 0) > 0 || (index === lesson.sections.length - 1 && activities)) &&
          <ProblemPractice problems={[...(section.problems ?? []), ...(index === lesson.sections.length - 1 ? activities?.practice ?? [] : [])]} language="fr" />}
      </div>
    </section>)}</div>
  </article>;
}
