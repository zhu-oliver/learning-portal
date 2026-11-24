import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ArcadeGamePlayer } from "@/components/arcade-game-player";
import { Brand } from "@/components/brand";
import { arcadeGames } from "@/lib/arcade-game";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = Object.entries(arcadeGames).find(([key]) => key === slug)?.[1];
  return { title: game?.name ?? "Games" };
}

export default async function PublicGamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game: slug } = await params;
  const game = Object.entries(arcadeGames).find(([key]) => key === slug)?.[1];
  if (!game) notFound();
  const src = `/learn/${game.subjectSlug}/${slug}/play`;
  return <div className="learning-shell">
    <header className="site-header container"><Brand href="/games" /><Link className="text-link" href="/">Sign in</Link></header>
    <main id="main" className={`container learning-main subject-page theme-${game.subjectSlug}`}>
      <Link className="back-link" href="/games"><ArrowLeft size={17} /> All games</Link>
      <header className="subject-heading"><div>
        <span className="eyebrow">{game.subject.toUpperCase()} GAME</span>
        <h1>{game.name}</h1>
        <p>{game.description}</p>
      </div></header>
      <p className="small-note">{slug === "planet-hopper"
        ? "Planet Hopper is unsaved exploration, whether or not you sign in."
        : "You can play without an account. Sign in to save game progress privately across devices."}</p>
      <ArcadeGamePlayer name={game.name} src={src} readySelector={game.readySelector}
        restartNote="Restart returns to the beginning of the game. Progress is saved only when you are signed in." />
    </main>
    <footer className="site-footer container"><span>Little Oak learning club</span><Link href="/privacy">Privacy &amp; parent notes</Link><Link href="/">Sign in</Link></footer>
  </div>;
}
