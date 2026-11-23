import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";

export const metadata = { title: "Fraction Factory" };

export default async function FractionFactoryPage() {
  await requireUser();
  return <div className="subject-page theme-math">
    <Link className="back-link" href="/learn/math"><ArrowLeft size={17} /> Back to Math</Link>
    <header className="subject-heading"><div>
      <span className="eyebrow">MATH GAMES</span>
      <h1>Fraction Factory</h1>
      <p>Slice, scoop, and pack fractions for hungry robots! Twelve levels explore equal parts, equivalent fractions, comparisons, addition, mixed numbers, fractions of sets, decimals, and percentages. Try Rush Mode for a faster challenge.</p>
    </div></header>
    <p className="small-note">Read the order, choose a slicer size, tap pieces to fill the box, then press Deliver. Whole adds a whole portion; Clear removes your selection. For comparison orders, choose the correct box. Hint offers help; Levels pauses a running order and lets you resume. Enter delivers, Escape clears, and W adds a whole. Fullscreen gives the factory more room.</p>
    <p className="small-note">Stars, coins, unlocks, and Rush best save privately to your account in Azure SQL. Sound and graphics settings stay local. Old shared-browser progress is imported only if you choose; progress is separate from quiz history. WebGL is required; moving graphics and flashing feedback warrant adult review.</p>
    <ArcadeGamePlayer name="Fraction Factory" src="/learn/math/fraction-factory/play" readySelector="#playBtn"
      restartNote="Restart game discards the current order and returns to the title; saved account progress and coins are kept." />
  </div>;
}
