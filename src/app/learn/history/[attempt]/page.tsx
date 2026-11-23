import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/session";
import { findResult, StorageError } from "@/lib/db";
import { ResultDetail } from "@/components/result-detail";

export default async function SavedResultPage({ params }: { params: Promise<{ attempt: string }> }) {
  const user = await requireUser();
  const { attempt } = await params;
  if (!z.uuid().safeParse(attempt).success) notFound();
  let stored: Awaited<ReturnType<typeof findResult>>;
  try {
    stored = await findResult(user.id, attempt);
  } catch (cause) {
    console.error("Could not load saved result:", cause);
    return <><Link className="back-link" href="/learn/history"><ArrowLeft size={17} /> My history</Link>
      <p className="error-notice" role="alert">{cause instanceof StorageError ? cause.message : "This result could not be loaded. Please try again or ask a parent to check the database."}</p><Link className="button secondary" href={`/learn/history/${attempt}`}>Retry</Link></>;
  }
  if (!stored) notFound();
  return <>
    <Link className="back-link" href="/learn/history"><ArrowLeft size={17} /> My history</Link>
    <div className="saved-result"><span className="eyebrow">{stored.result.subject}</span><h1>{stored.result.title}</h1>
      <p>Completed {stored.completedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</p>
      <ResultDetail result={stored.result} />
    </div>
  </>;
}
