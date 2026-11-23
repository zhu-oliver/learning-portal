"use client";

import { useId, useRef, useState } from "react";
import { problemIsComplete, problemIsCorrect, problemSolution, type Problem } from "@/modules/problems";
import { ProblemControl } from "./problem-controls";

function initialAnswer(problem: Problem): string[] {
  return problem.type === "sequence" ? problem.items.map((item) => item.id) : [];
}

export function ProblemPractice({ problems, language = "en", title }: { problems: readonly Problem[]; language?: "en" | "fr"; title?: string }) {
  if (!problems.length) throw new Error("Interactive practice needs at least one problem.");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string[]>(() => initialAnswer(problems[0]));
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const french = language === "fr";
  const finished = index === problems.length;
  const problem = problems[index];
  const correct = !finished && problemIsCorrect(problem, answer);

  return <section className="quiz problem-practice" aria-labelledby={id} lang={language}>
    <h2 id={id} tabIndex={-1} ref={heading}>{title ?? (french ? "Pratique interactive" : "Interactive practice")}</h2>
    {finished ? <div className="quiz-results">
      <h3>{french ? "Bravo pour tes efforts !" : "Thanks for giving it a try!"}</h3>
      <p>{score} {french ? "sur" : "of"} {problems.length}</p>
      <button type="button" className="button secondary" onClick={() => {
        setIndex(0); setAnswer(initialAnswer(problems[0])); setChecked(false); setScore(0); setAttempt(attempt + 1); heading.current?.focus();
      }}>{french ? "Réessayer" : "Try again"}</button>
    </div> : <>
      <p className="quiz-count">{french ? "Activité" : "Activity"} {index + 1} {french ? "sur" : "of"} {problems.length}</p>
      <h3>{problem.prompt}</h3>
      <ProblemControl key={`${attempt}-${problem.id}`} problem={problem} answer={answer} onChange={setAnswer} disabled={checked} language={language} />
      <div role="status">{checked && <div className={`quiz-feedback ${correct ? "correct" : ""}`}>
        <strong>{correct ? french ? "C'est juste !" : "That's right!" : french ? "Pas tout à fait. Regarde la solution." : "Not quite. Let's look at the solution."}</strong>
        <p>{problem.explanation}</p>
        <p><strong>{french ? "Solution :" : "Solution:"}</strong> {problemSolution(problem)}</p>
      </div>}</div>
      {checked ? <button type="button" className="button primary" onClick={() => {
        const next = index + 1; setIndex(next); setAnswer(next < problems.length ? initialAnswer(problems[next]) : []); setChecked(false); heading.current?.focus();
      }}>{index + 1 === problems.length ? french ? "Voir le résultat" : "See practice result" : french ? "Activité suivante" : "Next activity"}</button>
        : <button type="button" className="button primary" disabled={!problemIsComplete(problem, answer)} onClick={() => {
          if (checked || !problemIsComplete(problem, answer)) return;
          if (correct) setScore(score + 1);
          setChecked(true);
        }}>{french ? "Vérifier" : "Check my answer"}</button>}
    </>}
    <p className="quiz-privacy">{french ? "Pratique seulement. Ces réponses ne sont pas enregistrées et ne comptent pas dans le quiz final." : "Practice only. Answers are not saved and do not count toward the final lesson quiz."}</p>
  </section>;
}
