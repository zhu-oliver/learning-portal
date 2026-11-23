import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Map Quest" };

export default async function MapQuestPage() {
  await requireUser();
  return <div className="subject-page theme-science">
    <Link className="back-link" href="/learn/science"><ArrowLeft size={17} /> Back to Science</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">SCIENCE GAMES</span>
      <h1>Map Quest</h1>
      <p>Discover the world on an interactive globe! Explore countries, landmarks, nature, world regions, and coordinates, then try a discovery quiz and collect passport stamps. The original 12 chapters are also available.</p>
    </div></header>
    <p className="small-note">Drag to spin the globe; scroll or pinch to zoom. Explore freely lets you search and browse places without scoring. With the globe focused, arrow keys rotate and + or - zoom. In quizzes, tap a pin, a country, or an answer button; incorrect answers offer direction and distance hints. Correct answers show destination details. Passport displays your stamps and coins. Fullscreen gives the globe and reading panels more room.</p>
    <p className="small-note">Passport stamps, coins, original chapter stars/unlocks, and graphics settings stay in this browser, shared within the browser profile even after sign-out. Game results are not saved to your account or quiz history. Maps, images, and descriptions are hosted locally; choosing source or license links opens third-party sites. Borders are simplified educational illustrations, not authoritative legal maps. WebGL is required; moving graphics warrant adult review.</p>
    <ArcadeGamePlayer name="Map Quest" src="/learn/science/map-quest/play" readySelector="#play"
      restartNote="Restart game returns to the menu and discards the current expedition; saved device stamps, coins, stars, and unlocks are kept." />
  </div>;
}
