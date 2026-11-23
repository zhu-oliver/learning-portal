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
    <p className="small-note">Stars, last-played level, and graphics settings stay in this browser and are shared by people using this browser profile, even after sign-out. Game results are not saved to your account or quiz history. Pronunciation uses your browser/device English voice; the voice service may process words remotely. Picture and text clues are also provided. The game has moving 3D graphics and flashing feedback; ask an adult if it is right for you.</p>
    <ArcadeGamePlayer name="Spelling Snake" src="/learn/reading/spelling-snake/play" readySelector=".lvbtn"
      restartNote="Restart game returns to the level menu and discards the current run; saved device stars are kept." />
  </div>;
}
