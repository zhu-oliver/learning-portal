import Link from "next/link";
import { aiQuizQuestions, type StudioItem } from "@/modules/ai-content";
import { Quiz } from "./quiz";
import { SectionAudio } from "./section-audio";
import { GenerationStatus } from "./generation-status";

export function AiLesson({ lesson }: { lesson: StudioItem }) {
  const document = lesson.document;
  return <article className="lesson ai-created-lesson">
    <header className="lesson-heading">
      <p className="pill">AI GENERATED · ADULT REVIEW RECOMMENDED</p>
      <h1>{lesson.title}</h1>
      {document && <p>{document.summary}</p>}
      <p className="small-note">AI can make mistakes. Review this lesson with an adult. Its content is saved privately to your account; quiz attempts and scores here are not saved.</p>
      <p><Link href="/privacy">Privacy &amp; parent notes</Link></p>
      {document && <div className="studio-actions">
        <a className="button primary" href="#ai-lesson-quiz">Go to quiz</a>
        <Link className="button secondary" href={`/learn/studio?revise=${lesson.id}`}>Revise this lesson</Link>
      </div>}
    </header>
    {document ? <>
      <div className="lesson-sections">{document.sections.map((section, index) => <section className="lesson-section" key={index}>
        <span className="section-number">{String(index + 1).padStart(2, "0")}</span>
        <div><div className="section-title"><h2>{section.heading}</h2><SectionAudio heading={section.heading} body={section.body} /></div>
          <p className="lesson-body">{section.body}</p>
        </div>
      </section>)}</div>
      <div id="ai-lesson-quiz">
        <Quiz questions={aiQuizQuestions(document)} title="Your AI-created quiz"
          privacyNote="AI-generated practice: answers and scores are not saved. Your lesson and questions are saved in My saved learning." />
      </div>
    </> : lesson.status === "queued" || lesson.status === "processing" ?
      <GenerationStatus key={lesson.id} status={lesson.status} /> :
      <p className="error-notice" role="alert">{lesson.error ?? "This lesson's content is unavailable. Return to AI Learning Studio to try another request."}</p>}
  </article>;
}
