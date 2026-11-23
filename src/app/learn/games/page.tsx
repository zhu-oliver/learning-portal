import Link from "next/link";
import { ArrowLeft, ArrowRight, Gamepad2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { arcadeGames } from "@/lib/arcade-game";

export const metadata = { title: "Games" };

export default async function GamesPage() {
  await requireUser();
  return <div className="subject-page">
    <Link className="back-link" href="/learn"><ArrowLeft size={17} /> Back to your learning space</Link>
    <header className="subject-heading"><span className="subject-icon"><Gamepad2 size={38} /></span><div>
      <span className="eyebrow">LEARN THROUGH PLAY</span>
      <h1>Games</h1>
      <p>All our games in one place. Choose an adventure below, or find the same games inside Math, Language &amp; Reading, and Science.</p>
    </div></header>
    <div className="subject-cards dashboard-cards">{Object.entries(arcadeGames).map(([slug, game]) =>
      <Link href={`/learn/${game.subjectSlug}/${slug}`} className={`subject-card theme-${game.subjectSlug}`} key={slug}>
        <span className="module-count">{game.subject}</span>
        <h2>{game.name}</h2><p>{game.description}</p>
        <span className="card-action">Play {game.name} <ArrowRight size={19} /></span>
      </Link>,
    )}</div>
    <p className="small-note">Game milestones save privately to your account across devices, separate from quiz history. Planet Hopper is unsaved exploration. Device settings stay local; each game page explains its controls and parent notes.</p>
  </div>;
}
