"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Square, Volume2 } from "lucide-react";

let stopActiveSection: (() => void) | undefined;

export function SectionAudio({ heading, body, activity, language = "en", pronunciation = false }: { heading: string; body: string; activity?: string; language?: "en" | "fr"; pronunciation?: boolean }) {
  const [reading, setReading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const stopOwn = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    window.speechSynthesis?.getVoices();
    return () => { stopOwn.current?.(); };
  }, []);

  function read() {
    setError("");
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === "undefined") {
      setError(language === "fr" ? "La lecture audio n'est pas disponible dans ce navigateur." : "Read-aloud is not supported in this browser. Try a browser with an English speech voice available.");
      return;
    }
    const speech = window.speechSynthesis;
    const findVoice = (voices: SpeechSynthesisVoice[]) =>
      voices.find((candidate) => new RegExp(`^${language}[-_]CA$`, "i").test(candidate.lang)) ??
      voices.find((candidate) => new RegExp(`^${language}(?:[-_]|$)`, "i").test(candidate.lang));
    const missingVoice = () => setError(language === "fr" ? "Aucune voix française n'est disponible. Active une voix française sur ton appareil, puis réessaie." : "An English voice is not available yet. Enable an English voice on your device, wait a moment, and try again.");
    stopActiveSection?.();
    speech.cancel();
    let cancelWait: (() => void) | undefined;
    const finish = () => {
      if (stopOwn.current !== stop) return;
      cancelWait?.();
      cancelWait = undefined;
      stopOwn.current = undefined;
      if (stopActiveSection === stop) stopActiveSection = undefined;
      setReading(false);
      setLoading(false);
    };
    const stop = () => {
      finish();
      speech.cancel();
    };
    const play = (voice: SpeechSynthesisVoice) => {
      if (stopOwn.current !== stop) return;
      cancelWait?.();
      cancelWait = undefined;
      setLoading(false);
      const utterance = new SpeechSynthesisUtterance(
        pronunciation ? heading : `${heading}. ${body}${activity ? ` ${language === "fr" ? "À toi de jouer" : "Guided activity"}. ${activity}` : ""}`,
      );
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = .9;
      utterance.onend = finish;
      utterance.onerror = (event) => {
        if (stopOwn.current !== stop) return;
        finish();
        if (event.error === "canceled" || event.error === "interrupted") return;
        console.error("Section read-aloud failed:", event.error);
        setError(language === "fr" ? "La lecture a échoué. Vérifie le son et la voix, puis réessaie." : "Read-aloud failed. Check your sound and voice settings, then try again.");
      };
      setReading(true);
      try {
        speech.speak(utterance);
      } catch (cause: unknown) {
        stop();
        console.error("Section read-aloud could not start:", cause);
        setError(language === "fr" ? "La lecture n'a pas pu commencer. Vérifie ton navigateur et la voix." : "Read-aloud could not start. Check your browser and voice settings, then try again.");
      }
    };
    stopOwn.current = stop;
    stopActiveSection = stop;
    const voices = speech.getVoices();
    const voice = findVoice(voices);
    if (voice) {
      play(voice);
    } else if (voices.length) {
      finish();
      missingVoice();
    } else {
      setLoading(true);
      const check = () => {
        const available = findVoice(speech.getVoices());
        if (available) play(available);
      };
      const timeout = window.setTimeout(() => {
        const available = findVoice(speech.getVoices());
        if (available) play(available);
        else {
          finish();
          missingVoice();
        }
      }, 3000);
      speech.addEventListener("voiceschanged", check);
      cancelWait = () => {
        window.clearTimeout(timeout);
        speech.removeEventListener("voiceschanged", check);
      };
      check();
    }
  }

  const label = `${reading || loading ? pronunciation ? "Stop pronunciation:" : language === "fr" ? "Arrêter la lecture :" : "Stop reading" : pronunciation ? "Hear pronunciation:" : language === "fr" ? "Écouter :" : "Read section:"} ${heading}`;
  return <span className={`section-audio${pronunciation ? " pronunciation-audio" : " compact-audio"}`}>
    {reading || loading ?
      <button className={pronunciation ? "button secondary" : "audio-icon-button"} onClick={() => stopOwn.current?.()} aria-label={label} title={label} aria-busy={loading}>{loading ? <LoaderCircle className="loading-spinner" size={16} /> : <Square size={16} />}{pronunciation && (language === "fr" ? "Arrêter" : "Stop reading")}</button> :
      <button className={pronunciation ? "button secondary" : "audio-icon-button"} onClick={read} aria-label={label} title={label}><Volume2 size={16} />{pronunciation && "Hear word"}</button>}
    {loading && <span className={pronunciation ? undefined : "visually-hidden"} role="status">{language === "fr" ? "Chargement de la voix…" : "Loading voice..."}</span>}
    {error && <span role="alert" className="error-notice">{error}</span>}
  </span>;
}
