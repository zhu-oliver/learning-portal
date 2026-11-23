"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Learning portal page error:", error); }, [error]);
  return <main id="main" className="container empty-state"><h1>Something didn&apos;t load.</h1><p>Please try again. If this keeps happening, ask a parent to check the site.</p><button onClick={reset} className="button primary">Try again</button><Link className="text-link" href="/">Back home</Link></main>;
}
