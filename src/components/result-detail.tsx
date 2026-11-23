import type { StoredTestResult } from "@/lib/results";
import { formatElapsedTime } from "@/modules/mental-math";

export function ResultDetail({ result }: { result: StoredTestResult }) {
  return <div className="result-detail">
    <p className="result-total">Total: <strong>{result.score} / {result.total}</strong> ({Math.round(result.score / result.total * 100)}%)</p>
    {result.elapsedMs !== undefined && <p>Time taken: <strong>{formatElapsedTime(result.elapsedMs)}</strong> (minutes:seconds)</p>}
    {!result.sections && <p className="small-note">Only the final score{result.elapsedMs !== undefined ? " and time taken" : ""} was saved. Individual answers are not stored.</p>}
    {result.sections?.map((section) => <section key={section.title}>
      <h2>{section.title} <span>{section.score} / {section.total}</span></h2>
      <div className="answer-review">{section.items.map((item, index) =>
        <div key={`${index}-${item.prompt}`} className={`review-item ${item.correct ? "correct" : "incorrect"}`}>
          <strong>{item.correct ? "Correct" : "Keep practicing"}: {item.prompt}</strong>
          <p>Your answer: {item.answer || "(blank)"}</p>
          {!item.correct && <p>Correct answer: <strong>{item.expected}</strong></p>}
          {item.explanation && <p>{item.explanation}</p>}
        </div>,
      )}</div>
    </section>)}
  </div>;
}
