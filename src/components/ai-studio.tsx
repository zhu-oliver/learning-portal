"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createStudioLesson, refreshStudioLibrary, removeStudioLesson } from "@/app/studio-actions";
import type { StudioItem } from "@/modules/ai-content";
import { GenerationStatus } from "./generation-status";

type Props = { initialItems: StudioItem[]; initialLesson?: StudioItem; initialError?: string; configured: boolean };
export function AiStudio({ initialItems, initialLesson, initialError = "", configured }: Props) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<StudioItem | undefined>(initialLesson ?? initialItems.find((item) => item.status === "queued" || item.status === "processing"));
  const [prompt, setPrompt] = useState("");
  const [grade, setGrade] = useState(4);
  const [questionCount, setQuestionCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const requestId = useRef<string | null>(null);
  const pendingKey = items.filter((item) => item.status === "queued" || item.status === "processing").map((item) => item.id).join(",");
  const selectedId = selected?.id;

  useEffect(() => {
    if (!pendingKey) return;
    let active = true;
    let polling = false;
    const timer = setInterval(async () => {
      if (polling || document.hidden) return;
      polling = true;
      try {
        const reply = await refreshStudioLibrary();
        if (!active) return;
        if (!reply.ok) { setError(reply.error); return; }
        const item = reply.value.find((entry) => entry.id === selectedId);
        if (!active) return;
        setItems(reply.value);
        if (item) setSelected(item);
        if (item?.status === "ready" && selected?.status !== "ready") {
          setMessages((old) => [...old.slice(-9), { role: "AI", text: `Your lesson "${item.title}" is saved. Open it on its own page to read and try the quiz.` }]);
        }
      } catch {
        if (active) setError("Could not check the generation status. Use Refresh library to retry.");
      } finally { polling = false; }
    }, 10_000);
    return () => { active = false; clearInterval(timer); };
  }, [pendingKey, selectedId, selected?.status]);

  async function refresh() {
    setError("");
    setBusy(true);
    try {
      const reply = await refreshStudioLibrary();
      if (!reply.ok) { setError(reply.error); return; }
      setItems(reply.value);
      if (selectedId) {
        setSelected(reply.value.find((item) => item.id === selectedId));
      }
    } catch { setError("Could not refresh the library. Please try again."); }
    finally { setBusy(false); }
  }

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    requestId.current ??= crypto.randomUUID();
    try {
      const reply = await createStudioLesson({
        requestId: requestId.current, prompt, grade, questionCount, previousId: selected?.status === "ready" ? selected.id : null,
      });
      if (!reply.ok) { setError(reply.error); return; }
      const newItem: StudioItem = { id: reply.value, title: prompt.slice(0, 120), status: "queued", createdAt: new Date().toISOString(), document: null, error: null };
      setItems((old) => [newItem, ...old.filter((item) => item.id !== reply.value)]);
      setSelected(newItem);
      setMessages((old) => [...old.slice(-8), { role: "You", text: prompt }, { role: "AI", text: "Request queued. Your local connector will generate and save the lesson. You can leave and return to this library later." }]);
      setPrompt("");
      requestId.current = null;
    } catch { setError("The request could not be confirmed. Retry without changing the prompt to avoid duplicate requests."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    setBusy(true);
    setError("");
    try {
      const reply = await removeStudioLesson(id);
      if (!reply.ok) { setError(reply.error); return; }
      setItems((old) => old.filter((item) => item.id !== id));
      if (selectedId === id) setSelected(undefined);
      setConfirmDelete(null);
    } catch { setError("Could not delete the lesson. Please retry."); }
    finally { setBusy(false); }
  }

  return <article className="ai-studio">
    <header className="lesson-heading"><span className="eyebrow">YOUR OWN LEARNING ADVENTURE</span><h1>AI Learning Studio</h1>
      <p>Describe what you want to learn. Your local AI can write an in-depth lesson with examples and a multiple-choice quiz just for you.</p>
      <p className="small-note">AI can make factual mistakes or produce unsuitable content. Ask an adult to review it. Do not enter names, contact details, school information, or other personal data. No browsing, tools, or files are sent to the model.</p>
      <p className="small-note">Prompts and the selected lesson are processed by the site owner&apos;s LM Studio connector. Valid lessons are automatically saved privately to your Google account in Azure SQL. Requests can wait up to 24 hours; generation needs the owner&apos;s computer and connector online. Chat messages on this page are temporary; only generated content is kept after completion. <Link href="/privacy">Privacy &amp; parent notes</Link>.</p>
    </header>
    {!configured && <p className="error-notice" role="status">The AI connector is not configured. Existing lessons can still be opened; creating new ones needs a parent to complete the LM Studio setup.</p>}
    {error && <p className="error-notice" role="alert">{error}</p>}
    <div className="studio-columns">
      <section aria-labelledby="studio-chat-heading">
        <h2 id="studio-chat-heading">Chat with your learning helper</h2>
        <div className="studio-chat" role="log" aria-label="Learning conversation" aria-live="polite">
          {!messages.length && <p>Try: &quot;Teach me about food chains and ask me five questions.&quot;</p>}
          {messages.map((message, index) => <p key={index}><strong>{message.role}:</strong> {message.text}</p>)}
        </div>
        {selected?.status === "ready" && <>
          <p className="small-note">Your next message revises <strong>{selected.title}</strong>. It creates a new saved version and keeps the original.</p>
          <p><Link className="button secondary" href={`/learn/studio/${selected.id}`}>Open completed lesson &amp; quiz</Link></p>
        </>}
        {selected?.status === "failed" && <p role="status">{selected.error}</p>}
        {selected && (selected.status === "queued" || selected.status === "processing") && <GenerationStatus key={selected.id} status={selected.status} />}
        <form onSubmit={send} className="studio-form">
          <label htmlFor="studio-grade">Learning level</label>
          <select id="studio-grade" value={grade} onChange={(event) => setGrade(Number(event.target.value))} disabled={busy}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => <option value={value} key={value}>Grade {value}</option>)}
          </select>
          <label htmlFor="studio-count">Number of questions</label>
          <input id="studio-count" type="number" min={1} max={10} value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} required disabled={busy} />
          <label htmlFor="studio-prompt">What would you like to learn or change?</label>
          <textarea id="studio-prompt" value={prompt} maxLength={2000} rows={5} required disabled={busy} onChange={(event) => { setPrompt(event.target.value); requestId.current = null; }} />
          <p className="small-note">{prompt.length}/2000 characters · 10 requests per 24 hours · 100 saved items · one active request at a time</p>
          <div className="studio-actions">
            <button type="submit" className="button primary" disabled={!configured || busy || !prompt.trim() || Boolean(pendingKey)}>{busy ? "Please wait..." : selected?.status === "ready" ? "Create revised lesson" : "Create lesson & quiz"}</button>
            <button type="button" className="button secondary" disabled={busy} onClick={() => { setSelected(undefined); setMessages([]); requestId.current = null; }}>Start a new topic</button>
          </div>
        </form>
      </section>
      <section aria-labelledby="studio-library-heading">
        <h2 id="studio-library-heading">My saved learning</h2>
        <p className="small-note">Private to your account. Ready lessons stay available next time you sign in. Quiz attempts and scores here are not saved.</p>
        <button type="button" className="button secondary" disabled={busy} onClick={refresh}>Refresh library</button>
        {!items.length && <p>No saved lessons yet. Send your first learning request to begin.</p>}
        <ul className="studio-library">{items.map((item) => <li key={item.id}>
          <h3>{item.title}</h3>
          <p className="small-note">{(item.status === "queued" || item.status === "processing") && <LoaderCircle className="loading-spinner" size={14} aria-hidden="true" />} {item.status === "ready" ? "Saved" : item.status === "queued" ? "Connecting to AI Model..." : item.status === "processing" ? "Generating Lesson..." : "Unsuccessful"} · <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)} UTC</time></p>
          {item.error && <p>{item.error}</p>}
          <div className="studio-actions">
            {item.status === "ready" && <Link className="button secondary" href={`/learn/studio/${item.id}`}>Open lesson &amp; quiz</Link>}
            {item.status === "ready" && <button className="button secondary" disabled={busy} onClick={() => { setSelected(item); setMessages([]); requestId.current = null; }}>Revise lesson</button>}
            {confirmDelete === item.id ? <>
              <button className="button secondary" disabled={busy} onClick={() => remove(item.id)}>Confirm delete</button>
              <button className="button secondary" disabled={busy} onClick={() => setConfirmDelete(null)}>Keep item</button>
            </> : <button className="button secondary" disabled={busy} onClick={() => setConfirmDelete(item.id)}>{item.status === "queued" || item.status === "processing" ? "Cancel request" : "Delete item"}</button>}
          </div>
        </li>)}</ul>
      </section>
    </div>
  </article>;
}
