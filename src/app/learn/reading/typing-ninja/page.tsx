import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Typing Ninja" };

export default async function TypingNinjaPage() {
  await requireUser();
  return <div className="subject-page theme-reading">
    <Link className="back-link" href="/learn/reading"><ArrowLeft size={17} /> Back to Language &amp; Reading</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">ENGLISH GAMES</span>
      <h1>Typing Ninja</h1>
      <p>Slice flying fruit, lanterns, and shadow ninjas by typing their letters! Twelve levels grow from F and J to keyboard rows, capital letters, words, and sentences, with an extra survival challenge.</p>
    </div></header>
    <p className="small-note">Choose a level and follow the finger hints. Type the letters shown on flying targets; once you begin a word, finish it before switching targets. Use Shift for capitals and Space between words. A physical keyboard is best for touch-typing practice; the on-screen keyboard also supports tapping, including Shift. Escape or the pause button pauses play. Fullscreen gives the targets and keyboard more room.</p>
    <p className="small-note">Stars, unlocks, and survival best save privately to your account in Azure SQL; sound and graphics settings stay local. Old shared-browser progress is imported only if you choose. Typed game input is not saved and progress is separate from quiz history. WebGL is required. Cartoon sword effects, moving graphics, and flashing feedback warrant adult review.</p>
    <ArcadeGamePlayer name="Typing Ninja" src="/learn/reading/typing-ninja/play" readySelector="#card [data-a='play']"
      restartNote="Restart game discards the current round and returns to the title; saved account stars and survival best are kept." />
  </div>;
}
