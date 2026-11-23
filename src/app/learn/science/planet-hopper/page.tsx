import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Planet Hopper" };

export default async function PlanetHopperPage() {
  await requireUser();
  return <div className="subject-page theme-science">
    <Link className="back-link" href="/learn/science"><ArrowLeft size={17} /> Back to Science</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">SCIENCE GAMES</span>
      <h1>Planet Hopper</h1>
      <p>Take a little rocket on a big solar-system adventure! Explore the Sun, planets, dwarf planets, moons, asteroids, and comets, and read about their composition and other facts.</p>
    </div></header>
    <p className="small-note">Start exploring, then use W/S to fly forward/back, A/D to turn, and Q/E to fly up/down. Drag to look around; touch flight buttons are also available. Choose an object in space or from Destinations, then Fly to destination for autopilot. After arrival, drag to look around; flight controls return to manual flight. Fullscreen gives the destinations and information panels more room.</p>
    <p className="small-note">This is unsaved exploration with no scores or stored progress. Descriptions, the 3D engine, and surface textures are hosted locally. Optional Load reference image connects to Wikimedia Commons and shares connection information such as your IP address; source links open external sites. Orbits, scales, and positions are illustrative rather than live astronomical data. WebGL is required; moving graphics warrant adult review.</p>
    <ArcadeGamePlayer name="Planet Hopper" src="/learn/science/planet-hopper/play" readySelector="#startBtn"
      restartNote="Restart game returns to the welcome screen and resets your flight and selected destination." />
  </div>;
}
