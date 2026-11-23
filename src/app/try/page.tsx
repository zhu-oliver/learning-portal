import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { LessonContent } from "@/components/lesson-content";
import { math } from "@/modules/math";

export const metadata = { title: "Try a sample lesson" };

export default function SamplePage() {
  return <div className="learning-shell">
    <header className="site-header container"><Brand /><span className="pill">SAMPLE LESSON</span></header>
    <main id="main" className="container learning-main"><Link className="back-link" href="/"><ArrowLeft size={17} /> Back to sign in</Link>
      <p className="sample-notice">A little taste of Little Oak. This sample is open to everyone; sign in with Google to explore all subjects.</p>
      <Link className="button secondary" href="/try/activities">Try eight interactive activity types</Link>
      <LessonContent subject={math} lesson={math.lessons[0]} />
    </main>
    <footer className="site-footer container"><Link href="/">Ready to explore more? Back to sign in</Link><Link href="/privacy">Privacy &amp; parent notes</Link></footer>
  </div>;
}
