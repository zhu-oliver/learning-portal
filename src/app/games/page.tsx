import Link from "next/link";
import { ArrowLeft, ArrowRight, Gamepad2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { arcadeGames } from "@/lib/arcade-game";

export const metadata = { title: "Games" };

export default function PublicGamesPage() {
  return <div className="learning-shell">
    <header className="site-header container"><Brand href="/games" /><Link className="text-link" href="/">Sign in</Link></header>
    <main id="main" className="container learning-main subject-page">
      <Link className="back-link" href="/"><ArrowLeft size={17} /> Home</Link>
      <header className="subject-heading theme-science"><span className="subject-icon"><Gamepad2 size={38} /></span><div>
        <span className="eyebrow">LEARN THROUGH PLAY</span>
        <h1>Games</h1>
        <p>Pick a game and start playing—no sign-in required.</p>
      </div></header>
      <div className="subject-cards dashboard-cards">{Object.entries(arcadeGames).map(([slug, game]) =>
        <Link href={`/games/${slug}`} className={`subject-card theme-${game.subjectSlug}`} key={slug}>
          <span className="module-count">{game.subject}</span>
          <h2>{game.name}</h2><p>{game.description}</p>
          <span className="card-action">Play {game.name} <ArrowRight size={19} /></span>
        </Link>,
      )}</div>
      <p className="small-note">Games work without an account. Progress is temporary and isn&apos;t saved while signed out. Sign in to save progress to your account.</p>
    </main>
    <footer className="site-footer container"><span>Little Oak learning club</span><Link href="/privacy">Privacy &amp; parent notes</Link><Link href="/">Sign in to save game progress</Link></footer>
  </div>;
}
