"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

function GenerationProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const value = Math.min(100, (Date.now() - startedAt) / 400);
      setProgress(value);
      if (value === 100) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, []);
  return <progress className="generation-progress" max={100} value={progress}
    aria-label="Estimated lesson generation progress"
    aria-valuetext={`${Math.floor(progress)}% of the 40-second estimate; waiting for the lesson to finish`} />;
}

export function GenerationStatus({ status }: { status: "queued" | "processing" }) {
  return <div className="generation-status">
    {status === "queued" && <LoaderCircle className="loading-spinner" size={20} aria-hidden="true" />}
    <div className="generation-status-content">
      <strong role="status" aria-live="polite">{status === "processing" ? "Generating Lesson..." : "Connecting to AI Model..."}</strong>
      {status === "processing" && <GenerationProgress />}
    </div>
  </div>;
}
