import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { MathArmyGame } from "@/components/math-army-game";

export const metadata = { title: "Math Army" };

export default async function MathArmyPage() {
  await requireUser();
  return <div className="subject-page theme-math">
    <Link className="back-link" href="/learn/math"><ArrowLeft size={17} /> Back to Math</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">MATH GAMES</span>
      <h1>Math Army</h1>
      <p>Choose a level, then steer your army through the correct answers. Eight levels cover addition, subtraction, multiplication, division, and multi-step problems.</p>
    </div></header>
    <p className="small-note">Click or tap inside the game to play. Use arrow keys or WASD to steer, drag on a touch screen, and press P to pause. Fullscreen gives you more room; Escape exits fullscreen. Choose Low graphics in the game menu if needed.</p>
    <p className="small-note">This arcade game includes cartoon battles and flashing effects. Ask an adult if it is right for you. Stars, last-played level, and graphics settings are stored only in this browser and shared by people using this browser profile, even after sign-out. Game results are not saved to your account or quiz history.</p>
    <MathArmyGame />
  </div>;
}
