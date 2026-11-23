"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import type { Question } from "@/modules/types";
import type { TestAnswers } from "@/lib/results";
import { ResultSave } from "./result-save";
import { SectionAudio } from "./section-audio";
import { ProblemControl } from "./problems/problem-controls";
import { problemIsComplete, problemIsCorrect, problemSolution, type Problem } from "@/modules/problems";
import { initialInteractiveAnswer, quizEntries, type QuizAnswer } from "@/modules/quiz-entries";

export function Quiz({ questions, problems = [], activity, title = "A little brain stretch", practice = false, language = "en", privacyNote }: { questions: readonly Question[]; problems?: readonly Problem[]; activity?: { subject: string; lesson: string; grade?: number; program?: "core" | "immersion" }; title?: string; practice?: boolean; language?: "en" | "fr"; privacyNote?: string }) {
  const entries = quizEntries(questions, problems);
  const french = language === "fr";
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [interactiveAnswer, setInteractiveAnswer] = useState<string[]>(() => initialInteractiveAnswer(entries[0]));
  const heading = useRef<HTMLHeadingElement>(null);
  const quizId = useId();
  const finished = index === entries.length;
  const entry = entries[index];
  const question = entry?.kind === "choice" ? entry.question : undefined;
  const problem = entry?.kind === "interactive" ? entry.problem : undefined;
  const correct = problem ? problemIsCorrect(problem, interactiveAnswer) : selected === question?.answerIndex;
  const complete = problem ? problemIsComplete(problem, interactiveAnswer) : selected !== null;
  const submission = useMemo<TestAnswers | null>(() => activity ? {
    kind: "quiz", ...activity, ...(problems.length ? { quizVersion: 1 } : {}), answers,
  } : null, [activity, answers, problems.length]);

  function next() {
    setIndex(index + 1);
    setSelected(null);
    setInteractiveAnswer(initialInteractiveAnswer(entries[index + 1]));
    setChecked(false);
    heading.current?.focus();
  }

  function reset() {
    setIndex(0);
    setSelected(null);
    setInteractiveAnswer(initialInteractiveAnswer(entries[0]));
    setChecked(false);
    setScore(0);
    setAnswers([]);
    heading.current?.focus();
  }

  return <section className="quiz" aria-labelledby={quizId} lang={language}>
    <div className="eyebrow"><Sparkles size={16} /> {french ? "À TOI DE RÉFLÉCHIR" : "PUT YOUR IDEAS TO WORK"}</div>
    <h2 id={quizId} tabIndex={-1} ref={heading}>{finished ? french ? "Bravo pour tes efforts !" : "Look at you growing!" : title}</h2>
    {finished ? <div className="quiz-results">
      <div className="score-circle">{score}<span>{french ? "sur" : "of"} {entries.length}</span></div>
      <h3>{score === entries.length ? french ? "Toutes tes réponses sont correctes !" : "You got every answer right!" : french ? "Chaque essai aide à apprendre." : "Every try is a chance to learn."}</h3>
      <p>{french ? `Tu as ${score} bonnes réponses sur ${entries.length}. Relis la leçon ou réessaie à ton rythme.` : `You answered ${score} of ${entries.length} questions correctly. Revisit the lesson or try again at your own pace.`}</p>
      {submission && <ResultSave submission={submission} />}
      <button className="button secondary" onClick={reset}><RotateCcw size={17} /> {french ? "Réessayer" : "Try again"}</button>
    </div> : <>
      <p className="quiz-count">Question {index + 1} {french ? "sur" : "of"} {entries.length}</p>
      {question?.listeningText && <div key={question.id}>
        <div className="section-title"><h3>{french ? "Message à écouter" : "Listening passage"}</h3>
          <SectionAudio heading={french ? "Message à écouter" : "Listening passage"} body={question.listeningText} language={language} /></div>
        <details className="english-help"><summary>{french ? "Transcription (aide facultative)" : "Transcript (optional support)"}</summary><p>{question.listeningText}</p></details>
      </div>}
      {problem && <div><h3>{problem.prompt}</h3><ProblemControl key={`${problem.id}-${index}`} problem={problem} answer={interactiveAnswer} onChange={setInteractiveAnswer} disabled={checked} language={language} /></div>}
      {question && <fieldset disabled={checked}>
        <legend>{question.prompt}</legend>
        <div className="quiz-options">{question.options.map((option, optionIndex) =>
          <label key={option} className={`quiz-option ${selected === optionIndex ? "selected" : ""}`}>
            <input type="radio" name={`${quizId}-${question.id}`} value={optionIndex} checked={selected === optionIndex} onChange={() => setSelected(optionIndex)} />
            <span>{option}</span>
            {checked && optionIndex === question.answerIndex && <Check size={20} aria-label={french ? "Bonne réponse" : "Correct answer"} />}
          </label>,
        )}</div>
      </fieldset>}
      <div role="status" aria-live="polite">
        {checked && <div className={`quiz-feedback ${correct ? "correct" : ""}`}>
          <strong>{correct ? french ? "C'est juste !" : "That's right!" : french ? "Pas tout à fait. Essaie de comprendre pourquoi." : "Not quite, and that's okay!"}</strong>
          <p>{problem?.explanation ?? question?.explanation}</p>
          {problem && <p><strong>{french ? "Solution :" : "Solution:"}</strong> {problemSolution(problem)}</p>}
        </div>}
      </div>
      {checked ?
        <button className="button primary" onClick={next}>{index + 1 === entries.length ? french ? "Voir mon résultat" : "See my results" : french ? "Question suivante" : "Next question"}<ArrowRight size={18} /></button> :
        <button className="button primary" disabled={!complete} onClick={() => {
          if (!complete || checked) return;
          const recorded = problem ? [...interactiveAnswer] : selected;
          if (recorded === null) return;
          if (correct) setScore(score + 1);
          setAnswers([...answers, recorded]);
          setChecked(true);
        }}>{french ? "Vérifier ma réponse" : "Check my answer"}<Check size={18} /></button>}
    </>}
    <p className="quiz-privacy">{privacyNote ?? (french ? activity ? "Seul le résultat final est enregistré dans ton historique privé, pas les réponses individuelles." : "Pratique seulement : ces réponses ne comptent pas dans le quiz final et ne sont pas enregistrées." : activity ? "Only your final score is saved to private history. Individual answers are not stored." : practice ? "Section practice only: these answers do not count toward your lesson quiz and are not saved." : "Public sample: results are not saved or shared.")}</p>
  </section>;
}
