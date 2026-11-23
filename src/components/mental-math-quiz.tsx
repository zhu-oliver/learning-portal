"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatElapsedTime, generateMentalMathGrid, MENTAL_MATH_LIMIT_MS, MENTAL_MATH_ROWS, MENTAL_MATH_COLUMNS, type MentalMathActivity, type MentalMathGrid } from "@/modules/mental-math";
import type { TestAnswers } from "@/lib/results";
import { scoreMentalMath } from "@/lib/practice-results";
import { ResultSave } from "./result-save";

export function MentalMathQuiz({ activity }: { activity: MentalMathActivity }) {
  const [grid, setGrid] = useState<MentalMathGrid | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(MENTAL_MATH_LIMIT_MS);
  const [inputError, setInputError] = useState("");
  const [submission, setSubmission] = useState<Extract<TestAnswers, { kind: "mental-math" }> | null>(null);
  const started = useRef(0);
  const latestAnswers = useRef<string[]>([]);
  const finished = useRef(false);
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const symbol = activity.operation === "addition" ? "+" : "×";
  const result = useMemo(() => submission ? scoreMentalMath(submission) : null, [submission]);

  const finish = useCallback(() => {
    if (!grid || finished.current) return;
    finished.current = true;
    const elapsedMs = Math.min(MENTAL_MATH_LIMIT_MS, Math.max(0, Math.floor(performance.now() - started.current)));
    setSubmission({ kind: "mental-math", activity: activity.slug, ...grid, answers: [...latestAnswers.current], elapsedMs });
  }, [activity.slug, grid]);

  useEffect(() => {
    if (!grid || submission) return;
    cells.current[0]?.focus();
    function tick() {
      const left = Math.max(0, MENTAL_MATH_LIMIT_MS - (performance.now() - started.current));
      setRemaining(left);
      if (left === 0) finish();
    }
    const timer = window.setInterval(tick, 200);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [grid, submission, finish]);

  useEffect(() => {
    if (submission) resultHeading.current?.focus();
  }, [submission]);

  function start() {
    const empty = Array<string>(MENTAL_MATH_ROWS * MENTAL_MATH_COLUMNS).fill("");
    latestAnswers.current = empty;
    finished.current = false;
    started.current = performance.now();
    setAnswers(empty);
    setInputError("");
    setRemaining(MENTAL_MATH_LIMIT_MS);
    setSubmission(null);
    setGrid(generateMentalMathGrid(activity));
  }

  function update(index: number, value: string) {
    if (finished.current) return;
    if (performance.now() - started.current >= MENTAL_MATH_LIMIT_MS) { finish(); return; }
    const next = [...latestAnswers.current];
    next[index] = value;
    latestAnswers.current = next;
    setAnswers(next);
  }

  function move(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key !== "Tab" && event.key !== "Enter") return;
    const next = index + (event.key === "Tab" && event.shiftKey ? -1 : 1);
    if (next >= 0 && next < cells.current.length) {
      event.preventDefault();
      cells.current[next]?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      submitButton.current?.focus();
    }
  }

  const table = grid && <div className="mental-math-scroll">
    <table className="mental-math-table">
      <caption>{activity.title} — 8 rows × 5 columns{result ? " — answer review" : ""}</caption>
      <thead><tr><th scope="col" aria-label={activity.operation}>{symbol}</th>{grid.columns.map((number, column) =>
        <th scope="col" key={column}>{number}</th>)}</tr></thead>
      <tbody>{grid.rows.map((number, row) => <tr key={row}><th scope="row">{number}</th>{grid.columns.map((top, column) => {
        const index = column * MENTAL_MATH_ROWS + row;
        const reviewed = result?.sections[0].items[index];
        return <td key={column} className={reviewed ? reviewed.correct ? "correct" : "incorrect" : undefined}>
          {reviewed ? <div className="mental-math-reviewed">
            <strong>{reviewed.answer || "Blank"}</strong>
            <span>{reviewed.correct ? "Correct" : reviewed.answer ? "Incorrect" : "Unanswered"}</span>
            {!reviewed.correct && <span>Answer: {reviewed.expected}</span>}
          </div> : <input ref={(element) => { cells.current[index] = element; }}
            aria-label={`Row ${row + 1}, column ${column + 1}: ${number} ${symbol} ${top}`}
            type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={3}
            value={answers[index]} onChange={(event) => {
              if (/^\d{0,3}$/.test(event.target.value)) {
                setInputError("");
                update(index, event.target.value);
              } else setInputError("Use whole numbers from 0 to 999, or leave the cell blank.");
            }} onKeyDown={(event) => move(event, index)} />}
        </td>;
      })}</tr>)}</tbody>
    </table>
  </div>;

  return <article className="lesson theme-math">
    <header className="lesson-heading"><span className="eyebrow">MENTAL MATHEMATICS</span><h1>{activity.title}</h1>
      <p>Use the {activity.operation === "addition" ? "sum" : "product"} of each side number and top number to fill its cell. Complete 8 rows and 5 columns: 40 answers.</p>
      <p>Single digits range from 1 to 9; two-digit numbers range from 10 to 99. Headers are randomly chosen for every new quiz, with no repeats on either side.{activity.slug === "single-by-two-digit-multiplication" && " Two-digit numbers are on the left; single digits are on top."}</p>
    </header>
    {!grid && <><p>You have five minutes after clicking Start. Use Tab or Enter to work down each column, then move to the next. Shift+Tab goes backwards. Submit early if you are ready; otherwise answers submit automatically at five minutes. Blank answers count as incorrect.</p>
      <button className="button primary" onClick={start}>Start five-minute quiz</button>
      <p className="small-note">Only completed attempts are saved. Leaving or reloading discards an unfinished quiz. Time is measured in your browser, including time spent in another tab.</p>
    </>}
    {grid && !submission && <form onSubmit={(event) => { event.preventDefault(); finish(); }}>
      <div className="mental-math-status"><p role="timer" aria-label="Time remaining">Time remaining: <strong>{formatElapsedTime(remaining)}</strong></p>
        <p>{answers.filter((value) => value !== "").length} / 40 answered</p></div>
      <p className="small-note">Work down each column. You can change any answer before submitting.</p>
      {table}
      {inputError && <p className="error-notice" role="alert">{inputError}</p>}
      <button className="button primary" type="submit" ref={submitButton}>Submit answers</button>
    </form>}
    {submission && result && <section>
      <h2 ref={resultHeading} tabIndex={-1}>{result.elapsedMs === MENTAL_MATH_LIMIT_MS ? "Time is up — quiz submitted" : "Quiz submitted"}</h2>
      <p className="result-total">Total: <strong>{result.score} / {result.total}</strong> ({Math.round(result.score / result.total * 100)}%)</p>
      <p>Time taken: <strong>{submission.kind === "mental-math" && formatElapsedTime(submission.elapsedMs)}</strong> (minutes:seconds)</p>
      <p className="small-note">Green means correct. Red means incorrect or unanswered. Only your final score and time taken are saved; this table is shown for review now.</p>
      {table}
      <ResultSave submission={submission} />
      <button className="button secondary" onClick={start}>Start a new random quiz</button>
    </section>}
  </article>;
}
