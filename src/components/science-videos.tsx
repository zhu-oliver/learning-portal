"use client";

import { useId, useRef, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import type { ScienceVideo } from "@/modules/videos/types";

function VideoCard({ video }: { video: ScienceVideo }) {
  const [loaded, setLoaded] = useState(false);
  const loadButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const minutes = Math.floor(video.durationSeconds / 60);
  const seconds = String(video.durationSeconds % 60).padStart(2, "0");
  return <article className="science-video-card" aria-labelledby={titleId}>
    <h3 id={titleId}>{video.title}</h3>
    <p className="small-note">{video.channel} · {minutes}:{seconds}</p>
    <p>{video.learningFocus}</p>
    {loaded ? <>
      <div className="science-video-player">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`}
          title={`${video.title} — ${video.channel}`}
          width="640" height="360"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <button className="button secondary" onClick={() => {
        setLoaded(false);
        requestAnimationFrame(() => loadButton.current?.focus());
      }}><X size={16} /> Close video</button>
    </> : <div className="science-video-placeholder">
      <button ref={loadButton} className="button secondary" onClick={() => setLoaded(true)} aria-label={`Load YouTube video: ${video.title}`}>
        <Play size={18} /> Load video
      </button>
      <p className="small-note">Optional. Loading connects to YouTube; use its play button to watch.</p>
    </div>}
    <p><a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
      Watch {video.title} on YouTube (new tab) <ExternalLink size={14} aria-hidden="true" />
    </a></p>
    <p className="small-note">If embedding is blocked or the video is unavailable here, try the YouTube link with an adult.</p>
    <div className="guided-activity"><h4>Think about it</h4><p>{video.question}</p></div>
  </article>;
}

export function ScienceVideos({ videos }: { videos: readonly ScienceVideo[] }) {
  const headingId = useId();
  return <section className="science-videos" aria-labelledby={headingId}>
    <h2 id={headingId}>Extend your knowledge</h2>
    <p>Explore this lesson&apos;s ideas with a short educational video. Watching and reflecting are optional and do not change your quiz score.</p>
    <p className="small-note">Ask an adult to preview the video. YouTube content can change and may include ads or recommendations. Do not try demonstrations without an adult&apos;s supervision. No player or YouTube thumbnail loads until you choose to load a video.</p>
    <p className="small-note">We use YouTube&apos;s privacy-enhanced player, not an anonymous service. Loading it sends connection information to YouTube; playback can use cookies and other identifiers. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s privacy policy</a>.</p>
    <div className="science-video-grid">{videos.map((video) => <VideoCard key={video.videoId} video={video} />)}</div>
  </section>;
}
