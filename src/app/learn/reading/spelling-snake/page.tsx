import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Spelling Snake" };

export default async function SpellingSnakePage() {
  await requireUser();
  return <div className="subject-page theme-reading">
    <Link className="back-link" href="/learn/reading"><ArrowLeft size={17} /> Back to Language &amp; Reading</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">ENGLISH GAMES</span>
      <h1>Spelling Snake</h1>
      <p>Listen, find the letters, and grow your garden friend! Collect letters in order to spell eight words in each of seven levels, from little words and sight words to sound teams, magic E, and tricky treasures.</p>
    </div></header>
    <p className="small-note">Click or tap inside the game to play. Arrow keys or WASD steer; P pauses; H or Hear again repeats the word. On touch devices, use the direction buttons or swipe. Peek reveals the spelling briefly and costs 10 points. Avoid walls, rocks, bushes, and your tail. Use Fullscreen for more room, or choose Low graphics in the game menu.</p>
    <p className="small-note">Stars and last-played level save privately to your account in Azure SQL; graphics settings stay local. Old shared-browser progress is imported only if you choose. Progress is separate from quiz history. Pronunciation uses your browser/device English voice; the voice service may process words remotely. Picture and text clues are also provided. Moving 3D graphics and flashing feedback warrant adult review.</p>
    <ArcadeGamePlayer name="Spelling Snake" src="/learn/reading/spelling-snake/play" readySelector=".lvbtn"
      restartNote="Restart game returns to the level menu and discards the current run; saved account stars are kept." />
  </div>;
}
