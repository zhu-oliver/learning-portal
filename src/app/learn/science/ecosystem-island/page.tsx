import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Ecosystem Island" };

export default async function EcosystemIslandPage() {
  await requireUser();
  return <div className="subject-page theme-science">
    <Link className="back-link" href="/learn/science"><ArrowLeft size={17} /> Back to Science</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">SCIENCE GAMES</span>
      <h1>Ecosystem Island</h1>
      <p>Grow a living island! Explore eight guided lessons with prepared scenarios, follow food webs through ten missions, or experiment in the open sandbox.</p>
    </div></header>
    <p className="small-note">Choose Lessons to compare prepared islands about producers, consumers, carnivores, decomposers, dependencies, invasive species, biodiversity, and adaptations. Start each scenario and compare the same day using the population graph and field guide. Switching scenarios or Reset starts that island over; lessons are temporary and do not award stars. For missions and sandbox, select a plant or animal and tap the island to place it. Drag to orbit and pinch or use the camera buttons to zoom. Fullscreen gives the island and journal more room.</p>
    <p className="small-note">Mission stars and unlocks save privately to your account in Azure SQL; sound and graphics settings stay local. Old shared-browser progress is imported only if you choose. The current island is temporary and progress is separate from quiz history. WebGL is required. This is a simplified simulation, not a guide to handling real wildlife; outdoor activities need adult supervision.</p>
    <ArcadeGamePlayer name="Ecosystem Island" src="/learn/science/ecosystem-island/play" readySelector="#card [data-start]"
      restartNote="Restart game returns to the title and discards the current island; saved account stars and unlocked missions are kept." />
  </div>;
}
