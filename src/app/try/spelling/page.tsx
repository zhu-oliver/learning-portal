import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { SpellingBee } from "@/components/spelling-bee";

export const metadata = { title: "Try Spelling Bee" };

export default function SpellingSamplePage() {
  return <div className="learning-shell">
    <header className="site-header container"><Brand /><span className="pill">PUBLIC SAMPLE</span></header>
    <main id="main" className="container learning-main"><Link className="back-link" href="/"><ArrowLeft size={17} /> Back to sign in</Link><SpellingBee /></main>
  </div>;
}
