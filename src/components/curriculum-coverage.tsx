import Link from "next/link";
import { getGradeCoverage } from "@/modules/curriculum";

export function CurriculumCoverage({ subject, grade, program = "core" }: { subject: string; grade: number; program?: "core" | "immersion" }) {
  const coverage = getGradeCoverage(subject, grade, program);
  if (!coverage) return null;
  const mapped = coverage.expectations.filter((expectation) => expectation.references.length).length;
  return <section className="curriculum-coverage">
    <h2>Ontario learning map</h2>
    <p>{coverage.edition} curriculum · {coverage.specificCount} specific expectations{subject === "spelling" ? " in Language foundations support" : ""}.
      {" "}<a href={coverage.source} target="_blank" rel="noreferrer">Official Ministry of Education source</a></p>
    <p>Original learning summaries, not Ministry-endorsed courses. The map identifies where a skill is introduced or practised, not whether a child has mastered it.
      Guided speaking, writing, research, investigations, and design require adult feedback. Some activities require adult-selected texts, audio, materials, or community resources.
      Section questions are unsaved practice; only completed end-of-lesson quizzes and separate French matching tests are saved. Activity work and adult assessments are not collected.</p>
    {mapped < coverage.expectations.length && <p className="error-notice">Coverage is incomplete: {coverage.expectations.length - mapped} learning focuses still need lessons.</p>}
    <details><summary>View expectation-to-section map ({mapped} / {coverage.expectations.length} mapped focuses)</summary>
      <ul>{coverage.expectations.map((expectation) => <li key={expectation.id}>
        <strong>{expectation.id}</strong> — {expectation.focus}
        {expectation.references.length ? <ul>{expectation.references.map((reference) =>
          <li key={`${reference.lesson}-${reference.index}`}>
            <Link href={`/learn/${subject}/${program === "immersion" ? "immersion-" : ""}grade-${grade}/${reference.lesson}#section-${reference.index}`}>
              {reference.title}: {reference.section}
            </Link> — lesson and guided practice; adult assessment required
          </li>)}</ul> : <p>Not covered yet.</p>}
      </li>)}</ul>
    </details>
  </section>;
}
