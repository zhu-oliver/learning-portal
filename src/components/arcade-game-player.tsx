"use client";

import { useRef, useState } from "react";
import { Maximize, RotateCcw } from "lucide-react";

type Props = { name: string; src: string; readySelector: string; restartNote: string };

export function ArcadeGamePlayer({ name, src, readySelector, restartNote }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loaded() {
    setLoading(false);
    const game = frame.current?.contentDocument;
    if (!game?.querySelector("canvas") || !game.querySelector(readySelector)) {
      setError(`${name} could not start. Check that you are signed in and your browser allows WebGL and local storage, then try Restart game.`);
    }
  }

  async function fullscreen() {
    setError("");
    if (!stage.current?.requestFullscreen) {
      setError("Fullscreen is not supported in this browser. You can still play below.");
      return;
    }
    try { await stage.current.requestFullscreen(); frame.current?.focus(); }
    catch (cause) {
      console.error(`${name} fullscreen failed:`, cause instanceof Error ? cause.name : "Unknown error");
      setError("Fullscreen could not open. You can still play below.");
    }
  }

  return <section aria-label={`${name} game`}>
    <div className="arcade-game-controls">
      <button className="button secondary" onClick={() => { setLoading(true); setError(""); setVersion((value) => value + 1); }}>
        <RotateCcw size={17} /> Restart game
      </button>
      <button className="button secondary" onClick={fullscreen}><Maximize size={17} /> Fullscreen</button>
    </div>
    {loading && <p role="status">Loading {name}...</p>}
    {error && <p role="alert" className="error-notice">{error}</p>}
    <div ref={stage} className="arcade-game-stage">
      <iframe key={version} ref={frame} src={src} title={`${name}: interactive learning game`}
        allow="fullscreen" allowFullScreen onLoad={loaded}
        onError={() => { setLoading(false); setError(`${name} could not be loaded. Check your connection and try Restart game.`); }} />
    </div>
    <p className="small-note">{restartNote}</p>
  </section>;
}
