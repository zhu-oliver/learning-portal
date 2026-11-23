"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { getSpellingList, parseCustomWords, spellingLists } from "@/modules/spelling";
import type { TestAnswers } from "@/lib/results";
import { scoreSpelling } from "@/lib/practice-results";
import { ResultSave } from "./result-save";
import { ResultDetail } from "./result-detail";

interface BeeRun {
  listId: string;
  words: readonly string[];
}

export function SpellingBee({ saveResults = false, initialListId, quizTitle }: { saveResults?: boolean; initialListId?: string; quizTitle?: string }) {
  const [listId, setListId] = useState(initialListId ?? "test-1");
  const [custom, setCustom] = useState("");
  const [run, setRun] = useState<BeeRun | null>(null);
  const [phase, setPhase] = useState<"setup" | "spelling" | "vocabulary" | "results">("setup");
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [vocabularyAnswers, setVocabularyAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [speechAvailable, setSpeechAvailable] = useState<boolean | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const vocabulary = getSpellingList(run?.listId ?? "")?.vocabulary ?? [];
  const submission = useMemo<Extract<TestAnswers, { kind: "spelling" }> | null>(() => run ? {
    kind: "spelling", listId: run.listId,
    ...(run.listId === "custom" ? { words: [...run.words] } : {}),
    answers, vocabularyAnswers,
  } : null, [run, answers, vocabularyAnswers]);
  const result = useMemo(() => phase === "results" && submission ?
    scoreSpelling(submission) : null,
  [phase, submission]);

  useEffect(() => {
    const supported = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
    // Browser capability detection must happen after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeechAvailable(supported);
    return () => { if (supported) window.speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    if (phase === "spelling") input.current?.focus();
    else heading.current?.focus();
  }, [phase, index]);

  function speak(text: string) {
    if (!speechAvailable) return;
    setSpeechError("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => /^en[-_](US|CA|GB)/i.test(voice.lang)) ?? voices.find((voice) => /^en/i.test(voice.lang)) ?? null;
    utterance.lang = utterance.voice?.lang ?? "en-US";
    utterance.rate = .8;
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") return;
      console.error("Spelling read-aloud failed:", event.error);
      setSpeechError("The word could not be read aloud. Try again, check your device sound, or ask a parent to read the list.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function start(nextRun?: BeeRun) {
    try {
      const list = getSpellingList(listId);
      const next = nextRun ?? { listId, words: list?.words ?? parseCustomWords(custom) };
      setRun(next);
      setAnswers([]);
      setVocabularyAnswers([]);
      setTyped("");
      setIndex(0);
      setSelected(null);
      setError("");
      setSpeechError("");
      setPhase("spelling");
      speak(`Spell the word: ${next.words[0]}`);
    } catch (cause) {
      if (!(cause instanceof Error)) throw cause;
      setError(cause.message);
    }
  }

  function submitWord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!run || phase !== "spelling") return;
    window.speechSynthesis?.cancel();
    setAnswers([...answers, typed.trim()]);
    setTyped("");
    if (index + 1 < run.words.length) {
      setIndex(index + 1);
      speak(`Spell the word: ${run.words[index + 1]}`);
    } else {
      setIndex(0);
      setPhase(vocabulary.length ? "vocabulary" : "results");
    }
  }

  function submitVocabulary(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected === null) return;
    window.speechSynthesis?.cancel();
    setVocabularyAnswers([...vocabularyAnswers, selected]);
    setSelected(null);
    if (index + 1 < vocabulary.length) setIndex(index + 1);
    else setPhase("results");
  }

  return <div className="bee">
    <header className="bee-heading"><span className="bee-hex" aria-hidden="true">B</span><div><span className="eyebrow">LET YOUR WORDS TAKE FLIGHT</span><h1>{quizTitle ?? "Spelling Bee"}</h1></div></header>
    <h2 ref={heading} tabIndex={-1}>{phase === "setup" ? initialListId ? "Ready for your quiz?" : "Pick your word adventure" : phase === "spelling" ? "Listen, then spell" : phase === "vocabulary" ? "What does it mean?" : "All done!"}</h2>
    {phase === "setup" && <>
      <p>{initialListId ? listId === "custom" ? "Enter your own spelling words." : "This lesson quiz includes spelling and meaning questions." : "Choose a test with spelling and meaning questions, or enter your own spelling words."}</p>
      {!initialListId && <>
      <label className="field-label" htmlFor="word-list">Word list</label>
      <select id="word-list" value={listId} onChange={(event) => setListId(event.target.value)}>
        {spellingLists.map((list) => <option value={list.id} key={list.id}>{list.title} — {list.description}</option>)}
        <option value="custom">Custom word list (spelling only)</option>
      </select>
      </>}
      {listId === "custom" ? <>
        <label className="field-label" htmlFor="custom-words">Your words</label>
        <textarea id="custom-words" value={custom} maxLength={3000} onChange={(event) => setCustom(event.target.value)} placeholder={"assignment\nneighbor\nrhythm"} />
        <p className="small-note">1–50 different English words. Use one per line, commas, or semicolons. Don&apos;t include personal information.</p>
      </> : <div className="word-list-preview"><strong>{getSpellingList(listId)?.words.length} spelling words + {getSpellingList(listId)?.vocabulary.length} meaning questions</strong><p>{getSpellingList(listId)?.words.join(" · ")}</p></div>}
      {speechAvailable === false && <p className="error-notice" role="alert">Read-aloud is not supported in this browser. Try a current Edge, Chrome, or Safari browser. A parent can also read the selected list to you.</p>}
      {error && <p className="error-notice" role="alert">{error}</p>}
      <button className="button bee-button" onClick={() => start()}>{initialListId ? "Start quiz" : "Start the bee"}</button>
      <p className="small-note">{saveResults ? "Only the final score is saved to private history, not individual answers or custom words. Unfinished tests are not saved." : "Public sample: your result is not saved."} Read-aloud uses your browser/device speech service, which may process spoken text.</p>
    </>}
    {phase === "spelling" && run && <>
      <p className="bee-counter">Word {index + 1} of {run.words.length}</p>
      <progress aria-label="Spelling progress" value={index} max={run.words.length} />
      <div className="bee-stage"><button className="bee-speaker" onClick={() => speak(run.words[index])} disabled={!speechAvailable} aria-label="Hear the word again"><Volume2 size={56} /></button>
        <p>Tap the hexagon to hear the word again.</p>
        <form onSubmit={submitWord}>
          <label className="field-label" htmlFor="spelled-word">Spell the word</label>
          <input id="spelled-word" ref={input} value={typed} maxLength={80} onChange={(event) => setTyped(event.target.value)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          <button className="button bee-button" type="submit">{index + 1 === run.words.length ? "Finish spelling" : "Next word"}</button>
        </form>
        <p className="small-note">A blank answer counts as incorrect. Spelling is not case-sensitive.</p>
      </div>
    </>}
    {phase === "vocabulary" && <>
      <p className="bee-counter">Meaning question {index + 1} of {vocabulary.length}</p>
      <progress aria-label="Vocabulary progress" value={index} max={vocabulary.length} />
      <form onSubmit={submitVocabulary}><fieldset>
        <legend>{vocabulary[index].prompt}</legend>
        <div className="quiz-options">{vocabulary[index].options.map((option, optionIndex) =>
          <label className={`quiz-option ${selected === optionIndex ? "selected" : ""}`} key={option}>
            <input type="radio" name={vocabulary[index].id} checked={selected === optionIndex} onChange={() => setSelected(optionIndex)} /><span>{option}</span>
          </label>,
        )}</div>
      </fieldset><div className="bee-actions">
        <button className="button secondary" type="button" disabled={!speechAvailable} onClick={() => speak(`${vocabulary[index].prompt}. ${vocabulary[index].options.join(". ")}`)}><Volume2 size={18} /> Read it to me</button>
        <button className="button bee-button" disabled={selected === null} type="submit">{index + 1 === vocabulary.length ? "See my results" : "Next question"}</button>
      </div></form>
    </>}
    {speechError && <p role="alert" className="error-notice">{speechError}</p>}
    {phase === "results" && result && submission && <>
      <ResultDetail result={result} />
      {saveResults && <ResultSave submission={submission} />}
      <div className="bee-actions">
        {result.sections[0].items.some((item) => !item.correct) && <button className="button bee-button" onClick={() => start({ listId: "custom", words: result.sections[0].items.filter((item) => !item.correct).map((item) => item.expected) })}><RotateCcw size={18} /> Practice missed words</button>}
        <button className="button secondary" onClick={() => { setPhase("setup"); setRun(null); }}>{initialListId ? "Try this quiz again" : "New word list"}</button>
      </div>
      <p className="small-note">Missed-word practice is a new custom spelling-only attempt.</p>
    </>}
  </div>;
}
