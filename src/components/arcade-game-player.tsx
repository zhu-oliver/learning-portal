"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, RotateCcw } from "lucide-react";

type Props = { name: string; src: string; readySelector: string; restartNote: string };

export function ArcadeGamePlayer({ name, src, readySelector, restartNote }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [progressError, setProgressError] = useState(false);
  const [legacyAvailable, setLegacyAvailable] = useState(false);
  const [pendingProgress, setPendingProgress] = useState(false);
  const [reopenRequired, setReopenRequired] = useState(false);

  function progressCommand(action: "retry" | "import" | "status") {
    frame.current?.contentWindow?.postMessage({ type: "little-oak-progress-command", action }, window.location.origin);
  }
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow
        || event.data?.type !== "little-oak-progress"
        || !["loaded", "saving", "saved", "error"].includes(event.data.state) || typeof event.data.message !== "string") return;
      setProgressMessage(event.data.message);
      setProgressError(event.data.state === "error");
      setLegacyAvailable(event.data.legacyAvailable === true);
      setReopenRequired(event.data.reopenRequired === true);
      setPendingProgress((event.data.state === "saving" || event.data.state === "error") && event.data.reopenRequired !== true);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  function loaded() {
    setLoading(false);
    const game = frame.current?.contentDocument;
    if (!game?.querySelector("canvas") || !game.querySelector(readySelector)) {
      setError(`${name} could not start. Check sign-in and that your browser allows WebGL and local storage, and verify the account progress connection, then try Restart game.`);
    }
    progressCommand("status");
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
      <button className="button secondary" disabled={pendingProgress} onClick={() => { setLoading(true); setError(""); setProgressMessage(""); setProgressError(false); setLegacyAvailable(false); setReopenRequired(false); setVersion((value) => value + 1); }}>
        <RotateCcw size={17} /> Restart game
      </button>
      <button className="button secondary" onClick={fullscreen}><Maximize size={17} /> Fullscreen</button>
    </div>
    {loading && <p role="status">Loading {name}...</p>}
    {error && <p role="alert" className="error-notice">{error}</p>}
    {progressMessage && <p aria-live="polite" role={progressError ? "alert" : undefined} className={progressError ? "error-notice" : "small-note"}>{progressMessage}</p>}
    {pendingProgress && <p className="small-note">Keep this game open until progress saves. Restart is paused to protect unsaved rewards.</p>}
    {progressError && !reopenRequired && <button className="button secondary" onClick={() => progressCommand("retry")}>Retry saving</button>}
    {legacyAvailable && !pendingProgress && !reopenRequired && <div><p className="small-note">Old progress on this browser may belong to someone else. Import it only if it is yours. Reopen the game after importing to use those unlocks.</p>
      <button className="button secondary" onClick={() => progressCommand("import")}>Import this browser&apos;s old progress</button></div>}
    <div ref={stage} className="arcade-game-stage">
      <iframe key={version} ref={frame} src={src} title={`${name}: interactive learning game`}
        allow="fullscreen" allowFullScreen onLoad={loaded}
        onError={() => { setLoading(false); setError(`${name} could not be loaded. Check your connection and try Restart game.`); }} />
    </div>
    <p className="small-note">{restartNote}</p>
  </section>;
}
