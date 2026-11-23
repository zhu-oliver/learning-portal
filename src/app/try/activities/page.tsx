import Link from "next/link";
import { Brand } from "@/components/brand";
import { ProblemPractice } from "@/components/problems/problem-practice";
import { problemExamples } from "@/modules/problem-examples";

export const metadata = { title: "Interactive activity showcase" };

const names = ["Word search", "Words and pictures", "Drag-and-drop sorting", "Sequence ordering", "Matching pairs", "Labelling a diagram", "Fill in the blank", "Highlight misspelled words"];

export default function ActivitiesPage() {
  return <div className="learning-shell">
    <header className="site-header container"><Brand /><span className="pill">ACTIVITY SHOWCASE</span></header>
    <main id="main" className="container learning-main">
      <Link className="back-link" href="/try">Back to sample lessons</Link>
      <h1>More ways to learn</h1>
      <p className="history-intro">Try eight reusable activity types. These samples are public and do not save answers or scores. Choose any type below to try it directly.</p>
      <nav className="problem-showcase-links" aria-label="Activity types">{problemExamples.map((problem, index) =>
        <a href={`#${problem.id}`} key={problem.id}>{names[index]}</a>)}</nav>
      {problemExamples.map((problem, index) => <div id={problem.id} className="problem-showcase-item" key={problem.id}>
        <ProblemPractice problems={[problem]} title={names[index]} />
      </div>)}
      <Link className="button secondary" href="/learn">Back to your learning space (sign-in required)</Link>
    </main>
    <footer className="site-footer container"><Link href="/privacy">Privacy &amp; parent notes</Link></footer>
  </div>;
}
