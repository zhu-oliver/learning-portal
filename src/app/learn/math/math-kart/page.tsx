import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Math Kart" };

export default async function MathKartPage() {
  await requireUser();
  return <div className="subject-page theme-math">
    <Link className="back-link" href="/learn/math"><ArrowLeft size={17} /> Back to Math</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">MATH GAMES</span>
      <h1>Math Kart</h1>
      <p>Race through maths gates for turbo boosts! Eight tracks cover addition, subtraction, times tables, division, and multi-step problems. Play solo or race a friend on the same device in two-player split screen.</p>
    </div></header>
    <p className="small-note">Click or tap inside the game to play. Solo: arrow keys or A/D steer; Down or S brakes. Two players: Player 1 uses A/D and S, Player 2 uses Left/Right and Down. P pauses. Solo touch controls include steering and brake buttons. Fullscreen gives you more room; Escape exits fullscreen. Choose Low graphics in the game menu if needed.</p>
    <p className="small-note">Stars, player-count preference, and graphics settings stay in this browser and are shared by people using this browser profile, even after sign-out. They are separate from Math Army progress. Game results are not saved to your account or quiz history. The game uses moving 3D graphics and flashing effects; ask an adult if it is right for you.</p>
    <ArcadeGamePlayer name="Math Kart" src="/learn/math/math-kart/play" readySelector=".lv"
      restartNote="Restart game returns to the track menu and discards the current race; saved device stars are kept." />
  </div>;
}
