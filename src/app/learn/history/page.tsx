import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, History } from "lucide-react";
import { requireUser } from "@/lib/session";
import { HISTORY_PAGE_SIZE, listResults, StorageError } from "@/lib/db";
import { formatElapsedTime } from "@/modules/mental-math";

export const metadata = { title: "My result history" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const parsed = Number(params.page ?? "1");
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100000) notFound();
  const page = parsed;
  let history: Awaited<ReturnType<typeof listResults>> | undefined;
  let error: string | undefined;
  try {
    history = await listResults(user.id, page);
  } catch (cause) {
    console.error("Could not load result history:", cause);
    error = cause instanceof StorageError ? cause.message : "Your history could not be loaded. Ask a parent to check the database connection, then try again.";
  }
  return <>
    <Link className="back-link" href="/learn"><ArrowLeft size={17} /> All subjects</Link>
    <div className="history-heading"><History size={30} /><h1>My result history</h1></div>
    <p className="history-intro">Your completed quizzes and spelling tests, newest first. Only your signed-in account can see these results. Times are shown in UTC.</p>
    {error && <div role="alert" className="error-notice">{error}<br /><Link href={`/learn/history?page=${page}`}>Retry loading history</Link></div>}
    {history && <>
      {!history.results.length && <p className="empty-history">{page === 1 ? "No saved results yet. Complete a quiz or spelling test to start your history." : "There are no results on this page."}</p>}
      <div className="history-list">{history.results.map((item) =>
        <Link className="history-card" href={`/learn/history/${item.attemptId}`} key={item.attemptId}>
          <div><span className="eyebrow">{item.result.subject}</span><h2>{item.result.title}</h2><time dateTime={item.completedAt.toISOString()}>{item.completedAt.toISOString().replace("T", " ").slice(0, 19)} UTC</time>
            {item.result.elapsedMs !== undefined && <p>Time taken: {formatElapsedTime(item.result.elapsedMs)}</p>}
          </div>
          <div className="history-score"><strong>{item.result.score} / {item.result.total}</strong><span>{Math.round(item.result.score / item.result.total * 100)}%</span></div><ArrowRight size={20} />
        </Link>,
      )}</div>
      <nav className="history-pagination" aria-label="History pages">
        {page > 1 && <Link className="button secondary" href={`/learn/history?page=${page - 1}`}>Previous</Link>}
        <span>Page {page} · {history.total} saved {history.total === 1 ? "attempt" : "attempts"}</span>
        {page * HISTORY_PAGE_SIZE < history.total && <Link className="button secondary" href={`/learn/history?page=${page + 1}`}>Next</Link>}
      </nav>
    </>}
  </>;
}
