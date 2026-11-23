"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { GripVertical, RotateCcw, Volume2 } from "lucide-react";
import type { Lesson, FrenchWord } from "@/modules/types";
import type { TestAnswers } from "@/lib/results";
import { scoreFrenchMatching } from "@/lib/practice-results";
import { FrenchPicture } from "./french-picture";
import { ResultDetail } from "./result-detail";
import { ResultSave } from "./result-save";
import { ProblemPractice } from "./problems/problem-practice";
import { frenchVocabularyPractice } from "@/modules/activities/french";

function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FrenchLesson({ lesson, saveResults = false }: { lesson: Lesson; saveResults?: boolean }) {
  const words = lesson.frenchWords;
  if (!words || words.length < 1 || words.length > 50 || new Set(words.map((word) => word.id)).size !== words.length) {
    throw new Error("French lessons must contain between 1 and 50 uniquely identified words.");
  }
  return <FrenchActivity key={lesson.slug} lesson={lesson} words={words} saveResults={saveResults} />;
}

function FrenchActivity({ lesson, words, saveResults }: { lesson: Lesson; words: readonly FrenchWord[]; saveResults: boolean }) {
  const [phase, setPhase] = useState<"study" | "quiz" | "results">("study");
  const [images, setImages] = useState<readonly FrenchWord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [speechError, setSpeechError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [drag, setDrag] = useState<{ wordId: string; x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const pointer = useRef<{ id: number; wordId: string; startX: number; startY: number; x: number; y: number; active: boolean } | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const matchingGrid = useRef<HTMLDivElement>(null);
  const returnedWord = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = "french-activity-heading";
  const submission = useMemo<Extract<TestAnswers, { kind: "matching" }>>(() => ({
    kind: "matching", lesson: lesson.slug, ...(lesson.grade ? { grade: lesson.grade } : {}), imageIds: words.map((word) => matches[word.id]),
  }), [lesson.slug, lesson.grade, matches, words]);
  const result = useMemo(() => phase === "results" ? scoreFrenchMatching(lesson, submission.imageIds) : null, [phase, submission, lesson]);

  useEffect(() => {
    heading.current?.focus();
  }, [phase]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
  useEffect(() => () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
  }, []);
  useEffect(() => {
    if (returnedWord.current) {
      matchingGrid.current?.querySelector<HTMLButtonElement>(`[data-matching-word="${returnedWord.current}"]`)?.focus({ preventScroll: true });
      returnedWord.current = null;
    }
  }, [matches]);

  function speak(word: FrenchWord) {
    setSpeechError("");
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === "undefined") {
      setSpeechError("Read-aloud is not supported in this browser. Try Edge, Chrome, or Safari with a French voice installed.");
      return;
    }
    const voice = window.speechSynthesis.getVoices().find((candidate) => /^fr[-_]FR$/i.test(candidate.lang)) ??
      window.speechSynthesis.getVoices().find((candidate) => /^fr(?:[-_]|$)/i.test(candidate.lang));
    if (!voice) {
      setSpeechError("A French voice is not available yet. Install or enable a French voice on your device, wait a moment, and try again. We won't read French words with an English voice.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.french);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = .75;
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") return;
      console.error("French read-aloud failed:", event.error);
      setSpeechError("French read-aloud failed. Check your device sound and voice settings, then try again.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function startQuiz() {
    window.speechSynthesis?.cancel();
    setImages(shuffled(words));
    setMatches({});
    setSelected(null);
    setAnnouncement("");
    setSpeechError("");
    setPhase("quiz");
  }

  function unmatch(word: FrenchWord, number: number) {
    const next = { ...matches };
    delete next[word.id];
    returnedWord.current = word.id;
    setMatches(next);
    setSelected(null);
    setAnnouncement(`Unmatched ${word.french} from image ${number}. The word is back in the list. ${Object.keys(next).length} of ${words.length} words matched.`);
  }

  function chooseImage(image: FrenchWord, number: number, wordId = selected) {
    if (!wordId) return;
    const next = { ...matches };
    for (const [wordId, imageId] of Object.entries(next)) {
      if (imageId === image.id) delete next[wordId];
    }
    next[wordId] = image.id;
    setMatches(next);
    setAnnouncement(`Matched ${words.find((word) => word.id === wordId)?.french} to image ${number}. ${Object.keys(next).length} of ${words.length} words matched. You can change any match before checking.`);
    setSelected(null);
    matchingGrid.current?.querySelector<HTMLButtonElement>(`[data-matching-image="${image.id}"]`)?.focus({ preventScroll: true });
  }

  function imageAtPoint(x: number, y: number) {
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-matching-image]");
    return target && matchingGrid.current?.contains(target) ? target.dataset.matchingImage ?? null : null;
  }

  function scrollWhileDragging() {
    const current = pointer.current;
    if (!current?.active) return;
    const edge = 64;
    const speed = current.y < edge ? -Math.ceil((edge - current.y) / 4) :
      current.y > window.innerHeight - edge ? Math.ceil((current.y - window.innerHeight + edge) / 4) : 0;
    if (speed) window.scrollBy(0, Math.max(-16, Math.min(16, speed)));
    setDropTarget(imageAtPoint(current.x, current.y));
    scrollFrame.current = requestAnimationFrame(scrollWhileDragging);
  }

  function beginPointer(event: PointerEvent<HTMLButtonElement>, wordId: string) {
    if (pointer.current || !event.isPrimary || event.button !== 0) return;
    if (event.pointerType !== "mouse" && (!(event.target instanceof Element) || !event.target.closest("[data-drag-handle]"))) return;
    suppressClick.current = false;
    pointer.current = {
      id: event.pointerId, wordId, startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY, active: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePointer(event: PointerEvent<HTMLButtonElement>) {
    const current = pointer.current;
    if (!current || current.id !== event.pointerId) return;
    current.x = event.clientX;
    current.y = event.clientY;
    if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) >= 8) {
      current.active = true;
      setSelected(current.wordId);
      scrollFrame.current = requestAnimationFrame(scrollWhileDragging);
    }
    if (current.active) {
      setDrag({ wordId: current.wordId, x: current.x, y: current.y });
      setDropTarget(imageAtPoint(current.x, current.y));
    }
  }

  function endPointer(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const current = pointer.current;
    if (!current || current.id !== event.pointerId) return;
    pointer.current = null;
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = null;
    setDrag(null);
    setDropTarget(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!current.active) return;
    suppressClick.current = true;
    const imageId = cancelled ? null : imageAtPoint(event.clientX, event.clientY);
    const index = images.findIndex((image) => image.id === imageId);
    if (index >= 0) chooseImage(images[index], index + 1, current.wordId);
    else {
      setSelected(null);
      setAnnouncement("No match changed. Drag a word onto an image, or select a word and then its image.");
    }
  }

  return <article className="french-lesson theme-french">
    <header className="lesson-heading"><span className="eyebrow">BONJOUR, EXPLORER</span>{lesson.grade ? <h2>Picture vocabulary practice</h2> : <h1>{lesson.title}</h1>}<p>{lesson.introduction}</p>
      <p className="small-note">About {lesson.durationMinutes} minutes · Learn the article with each noun: un/le (masculine), une/la (feminine), l&apos; before a vowel sound, and des/les for plural nouns.</p>
    </header>
    <h2 id={headingId} ref={heading} tabIndex={-1}>{phase === "study" ? "See it. Hear it. Learn it." : phase === "quiz" ? `Match ${words.length} words to ${words.length} images` : "Your French discoveries"}</h2>
    {phase === "study" && <>
      <p>Study all {words.length} cards. Tap the speaker to hear French pronunciation and repeat it aloud.</p>
      <div className="french-study-grid">{words.map((word) =>
        <section className="french-word-card" key={word.id}>
          <FrenchPicture wordId={word.id} label={word.english} />
          <h3 lang="fr">{word.french}</h3><p className="word-meaning">{word.english}</p><p>{word.note}</p>
          <button className="button secondary" onClick={() => speak(word)} aria-label={`Listen to ${word.french}`}><Volume2 size={17} /> Listen <span lang="fr">en français</span></button>
        </section>,
      )}</div>
      <p className="small-note">Read-aloud needs a French voice on your browser/device. The voice service may process the spoken text remotely. No microphone is used.</p>
      {Object.hasOwn(frenchVocabularyPractice, lesson.slug) && <ProblemPractice problems={frenchVocabularyPractice[lesson.slug]} />}
      <button className="button primary" onClick={startQuiz}>I&apos;m ready — start matching</button>
    </>}
    {speechError && <p className="error-notice" role="alert">{speechError}</p>}
    {phase === "quiz" && <>
      <p>Drag a French word onto its picture; matched words leave the list. Click or tap a matched picture with no word selected to unmatch it and return its word to the list. With touch or a pen, drag the grip beside the word; swipe elsewhere in the word bank to scroll it. You can also select a word and then its picture, or use Tab and Enter/Space. Dropping onto an occupied picture returns its previous word to the list. Hold near the top or bottom of the screen while dragging to scroll the page.</p>
      <p className="matching-count">{Object.keys(matches).length} / {words.length} matched</p>
      <div className="matching-grid" ref={matchingGrid} aria-labelledby={headingId}>
        <div className="matching-words"><h3>Words remaining: {words.length - Object.keys(matches).length}</h3>
          {Object.keys(matches).length === words.length && <p className="matching-bank-empty">All words matched! Click a picture to return its word, or check your matches.</p>}
          {words.map((word, index) => {
          if (matches[word.id]) return null;
          return <button key={word.id} data-matching-word={word.id} className={`matching-word ${selected === word.id ? "selected" : ""} ${drag?.wordId === word.id ? "dragging" : ""}`} aria-pressed={selected === word.id}
            onPointerDown={(event) => beginPointer(event, word.id)} onPointerMove={movePointer}
            onPointerUp={(event) => endPointer(event)} onPointerCancel={(event) => endPointer(event, true)}
            onLostPointerCapture={(event) => endPointer(event, true)}
            onClick={(event) => {
              if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
              suppressClick.current = false;
              setSelected((current) => current === word.id ? null : word.id);
            }}>
            <span><GripVertical size={24} data-drag-handle aria-hidden="true" /> {index + 1}. <span lang="fr">{word.french}</span></span>{" "}<span>Not matched</span>
          </button>;
        })}</div>
        <div><h3>{words.length} images</h3><div className="matching-images">{images.map((image, index) => {
          const owner = words.find((word) => matches[word.id] === image.id);
          return <button key={image.id} data-matching-image={image.id} className={`matching-image ${owner ? "assigned" : ""} ${dropTarget === image.id ? "drop-target" : ""}`}
            disabled={!selected && !drag && !owner} onClick={() => {
              if (selected) chooseImage(image, index + 1);
              else if (owner) unmatch(owner, index + 1);
            }}
            aria-label={`Image ${index + 1}: ${image.english}${owner ? `, matched to ${owner.french}${selected ? "" : ", click to unmatch"}` : ""}`}>
            <span className="image-number">{index + 1}</span><FrenchPicture wordId={image.id} label={image.english} />
            <span className="matching-image-label" lang={owner ? "fr" : undefined}>{owner?.french ?? "Drop a word here"}</span>
            {owner && <span className="matching-unmatch">{selected ? "Replace match" : "Click to unmatch"}</span>}
          </button>;
        })}</div></div>
      </div>
      {drag && <div className="matching-drag-preview" aria-hidden="true" lang="fr"
        style={{ left: Math.max(8, Math.min(drag.x + 12, window.innerWidth - 248)), top: Math.max(8, drag.y - 48) }}>
        {words.find((word) => word.id === drag.wordId)?.french}
      </div>}
      <p role="status" aria-live="polite" className="matching-status">{announcement || "Drag a word onto a picture, or select a word to begin."}</p>
      <div className="bee-actions"><button className="button primary" disabled={Object.keys(matches).length !== words.length} onClick={() => { setPhase("results"); setSelected(null); }}>Check all {words.length} matches</button>
        <button className="button secondary" onClick={() => { setPhase("study"); setMatches({}); }}>Back to studying (resets matches)</button></div>
    </>}
    {phase === "results" && result && <>
      <ResultDetail result={result} />
      <div className="french-review-images">{words.map((word, index) =>
        <div key={word.id}><FrenchPicture wordId={word.id} label={word.english} /><strong lang="fr">{word.french}</strong><span>{word.english}</span><span>{result.sections[0].items[index].correct ? "Correct match" : "Review this match"}</span></div>,
      )}</div>
      {saveResults ? <ResultSave submission={submission} /> : <p className="small-note">Public sample: results are not saved.</p>}
      <div className="bee-actions"><button className="button secondary" onClick={startQuiz}><RotateCcw size={17} /> Try a new matching quiz</button><button className="button secondary" onClick={() => setPhase("study")}>Study the words again</button></div>
    </>}
  </article>;
}
