"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { saveTestResult } from "@/app/result-actions";
import type { TestAnswers, TestSubmission } from "@/lib/results";

export function ResultSave({ submission }: { submission: TestAnswers }) {
  const payload = useRef<TestSubmission | null>(null);
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    if (!payload.current) payload.current = { ...submission, attemptId: crypto.randomUUID() };
    saveTestResult(payload.current).then((response) => {
      if (!active) return;
      if (response.ok) { setStatus("saved"); setAttemptId(response.attemptId); }
      else { setStatus("error"); setError(response.error); }
    }).catch((cause: unknown) => {
      console.error("Save request failed:", cause);
      if (active) { setStatus("error"); setError("The save request failed. Please try again before leaving this page."); }
    });
    return () => { active = false; };
  }, [submission, retry]);

  return <div className="result-save" aria-live="polite">
    {status === "saving" && <p>Saving your result...</p>}
    {status === "saved" && <p>Saved to your private history. <Link href={`/learn/history/${attemptId}`}>View saved result</Link></p>}
    {status === "error" && <><p role="alert">{error}</p><button className="button secondary" onClick={() => { setStatus("saving"); setRetry(retry + 1); }}>Retry saving</button></>}
    {status !== "saved" && <p className="small-note">Don&apos;t leave or restart yet if you want to save this attempt.</p>}
  </div>;
}
