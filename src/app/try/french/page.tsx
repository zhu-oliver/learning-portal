import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { FrenchLesson } from "@/components/french-lesson";
import { french } from "@/modules/french";

export const metadata = { title: "Try French" };

export default function FrenchSamplePage() {
  return <div className="learning-shell">
    <header className="site-header container"><Brand /><span className="pill">PUBLIC SAMPLE</span></header>
    <main id="main" className="container learning-main"><Link className="back-link" href="/"><ArrowLeft size={17} /> Back to sign in</Link><FrenchLesson lesson={french.lessons[0]} /></main>
  </div>;
}
