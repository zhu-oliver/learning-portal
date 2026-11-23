import { Clock, Lightbulb } from "lucide-react";
import type { Lesson, SubjectModule } from "@/modules/types";
import { SubjectIcon } from "./subject-icon";
import { Quiz } from "./quiz";
import { SectionAudio } from "./section-audio";
import { ProblemPractice } from "./problems/problem-practice";
import { getLessonActivities } from "@/modules/activities";
import { getScienceLessonVideos } from "@/modules/videos/science";
import { ScienceVideos } from "./science-videos";

export function LessonContent({ subject, lesson, saveResults = false, showQuiz = true }: { subject: SubjectModule; lesson: Lesson; saveResults?: boolean; showQuiz?: boolean }) {
  const activities = getLessonActivities(subject.slug, lesson);
  const videos = subject.slug === "science" ? getScienceLessonVideos(lesson) : undefined;
  return <article className={`lesson theme-${subject.theme}`}>
    <header className="lesson-heading">
      <div className="eyebrow"><SubjectIcon theme={subject.theme} size={18} /> {subject.title.toUpperCase()} EXPLORER</div>
      <h1>{lesson.title}</h1>
      <p>{lesson.introduction}</p>
      <span className="time-label"><Clock size={16} /> About {lesson.durationMinutes} minutes &middot; {lesson.grade ? `Grade ${lesson.grade} · work across several sessions` : "All-grades practice"}</span>
      {lesson.expectations && <p>Curriculum focus: {lesson.expectations.join(", ")}. {lesson.source && <a href={lesson.source} target="_blank" rel="noreferrer">Official Ontario source</a>}</p>}
    </header>
    <div className={lesson.grade ? "curriculum-sections" : "lesson-grid"}>
      <div className="lesson-sections">{lesson.sections.map((section, index) =>
        <section className="lesson-section" id={`section-${index}`} key={section.heading}>
          <span className="section-number">{String(index + 1).padStart(2, "0")}</span>
          <div><div className="section-title"><h2>{section.heading}</h2>
            <SectionAudio heading={section.heading} body={section.body} activity={section.activity} /></div>
            {section.expectations && <p className="small-note">Ontario focus: {section.expectations.join(", ")}</p>}
            <p>{section.body}</p>
            {section.activity && <div className="guided-activity"><h3>Try it — guided activity</h3><p>{section.activity}</p><p className="small-note">Discuss or demonstrate this with an adult. This skill is not verified by the quiz.</p></div>}
            {section.questions && <Quiz questions={section.questions} title="Section practice" practice />}
            {((section.problems?.length ?? 0) > 0 || (index === lesson.sections.length - 1 && activities)) &&
              <ProblemPractice problems={[...(section.problems ?? []), ...(index === lesson.sections.length - 1 ? activities?.practice ?? [] : [])]} />}
          </div>
        </section>,
      )}</div>
      <aside className="curiosity-note"><Lightbulb size={26} /><h3>Make it your own</h3><p>Pause, draw a picture, or explain what you learned to someone at home. Curiosity is your superpower.</p></aside>
    </div>
    {videos && <ScienceVideos videos={videos} />}
    {showQuiz && lesson.questions.length > 0 && <div className="lesson-final-quiz">
      <p>Ready to bring it all together? This quiz covers {lesson.grade ? "every section in this lesson" : "the lesson"}. Section practice scores are not included.</p>
      <Quiz key={`${subject.slug}/${lesson.slug}`} title="End-of-lesson quiz" questions={lesson.questions} problems={activities?.final} activity={saveResults ? { subject: subject.slug, lesson: lesson.slug, ...(lesson.grade ? { grade: lesson.grade } : {}) } : undefined} />
    </div>}
  </article>;
}
