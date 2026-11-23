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
      <p>Grow a living island! Build habitats and follow food webs through ten missions about plants, pollination, predators, decomposers, drought, and biodiversity, or experiment in the open sandbox.</p>
    </div></header>
    <p className="small-note">Choose a mission, select a plant or animal, then tap the island to place it. Start runs the simulation; use the speed buttons and population graph to watch changes. Drag to orbit and pinch or use the camera buttons to zoom. The field journal explains your goal; Reset starts the current mission again. Fullscreen gives the island and journal more room.</p>
    <p className="small-note">Mission stars, unlocks, and sound/graphics settings stay in this browser, shared within the browser profile even after sign-out. The current island is temporary; results are not saved to your account or quiz history. WebGL is required. This is a simplified simulation, not a guide to handling real wildlife; ask an adult before trying any outdoor activity.</p>
    <ArcadeGamePlayer name="Ecosystem Island" src="/learn/science/ecosystem-island/play" readySelector="#card [data-start]"
      restartNote="Restart game returns to the title and discards the current island; saved device stars and unlocked missions are kept." />
  </div>;
}
