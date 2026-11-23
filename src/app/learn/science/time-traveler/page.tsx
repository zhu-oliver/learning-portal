import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Time Traveler" };

export default async function TimeTravelerPage() {
  await requireUser();
  return <div className="subject-page theme-science">
    <Link className="back-link" href="/learn/science"><ArrowLeft size={17} /> Back to Science</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">SCIENCE GAMES</span>
      <h1>Time Traveler</h1>
      <p>Repair your time machine across 12 eras, from dinosaurs and ancient civilizations to inventions and the Moon landing. Find three parts, answer their questions, help a character, and arrange events from oldest to newest to power your next journey.</p>
    </div></header>
    <p className="small-note">Walk with WASD or arrow keys, or tap the ground. Drag to look around; R resets the view. E or Space talks to nearby characters and uses objects; you can also tap them. Hint helps you find your next task. Drag timeline cards or use their up/down arrows to reorder events. Eras lets you revisit unlocked areas; Timeline shows your completed journeys. Fullscreen gives the world and puzzles more room.</p>
    <p className="small-note">Stars, unlocked eras, and sound/graphics settings stay in this browser, shared within the browser profile even after sign-out. Your current exploration is temporary; game answers and results are not saved to your account or quiz history. WebGL is required. This fantasy adventure mixes simplified history and science with fictional characters; moving graphics and flashing warp effects warrant adult review.</p>
    <ArcadeGamePlayer name="Time Traveler" src="/learn/science/time-traveler/play" readySelector="#play"
      restartNote="Restart game returns to the title and discards current era progress; saved device stars and unlocked eras are kept." />
  </div>;
}
