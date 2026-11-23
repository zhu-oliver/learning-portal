import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Code Commander" };

export default async function CodeCommanderPage() {
  await requireUser();
  return <div className="subject-page theme-math">
    <Link className="back-link" href="/learn/math"><ArrowLeft size={17} /> Back to Math</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">MATH GAMES</span>
      <h1>Code Commander</h1>
      <p>Big adventures start with little commands! Build a program to guide your tank, collect stars, and reach the flag. Across 25 missions, practise sequences, turns, loops, nested loops, and conditions while planning around obstacles.</p>
    </div></header>
    <p className="small-note">Choose a mission, then drag or tap command blocks to build your plan. RUN executes the program; STEP runs one command at a time. RESET returns the tank to its starting point while keeping your program. Select a Repeat block to add commands inside it; Add to main returns to the outer program. Use Hint when stuck, and win a mission to unlock the next. Fullscreen gives the command lab more room; choose Low graphics if needed.</p>
    <p className="small-note">Stars, unlocked missions, and graphics settings stay in this browser and are shared by people using this browser profile, even after sign-out. Programs are temporary, and game results are not saved to your account or quiz history. The game has cartoon tanks, firing effects, explosions, and moving 3D graphics; ask an adult if it is right for you.</p>
    <ArcadeGamePlayer name="Code Commander" src="/learn/math/code-commander/play" readySelector="#play"
      restartNote="Restart game returns to the main menu and discards the current program; saved device stars and unlocked missions are kept." />
  </div>;
}
