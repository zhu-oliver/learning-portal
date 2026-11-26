import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const script = readFileSync(path.join(process.cwd(), "public", "games", "game-sound.js"), "utf8");

function setup(game = "math-army", initial?: string) {
  const doc = document.implementation.createHTMLDocument();
  doc.documentElement.dataset.portalSoundGame = game;
  const events = new EventTarget();
  const start = vi.fn();
  const gain = () => ({ gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() });
  const contexts: AudioContext[] = [];
  class AudioContext {
    state = "suspended";
    currentTime = 0;
    destination = {};
    resume = vi.fn(async () => { this.state = "running"; });
    createGain = gain;
    createOscillator() {
      return { type: "", frequency: { setValueAtTime: vi.fn() }, connect: vi.fn().mockReturnValue(gain()), start, stop: vi.fn() };
    }
    constructor() { contexts.push(this); }
  }
  const storage = new Map<string, string>();
  if (initial) storage.set(`portalSound:${game}`, initial);
  const localStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) };
  const speechSynthesis = { cancel: vi.fn() };
  const win = {
    AudioContext, speechSynthesis,
    addEventListener: events.addEventListener.bind(events),
    portalSound: undefined as undefined | { enabled: boolean; play: (kind?: string) => void },
  };
  runInNewContext(script, { window: win, document: doc, localStorage, console });
  doc.dispatchEvent(new Event("DOMContentLoaded"));
  const button = doc.querySelector("button")!;
  return { win, events, button, storage, start, speechSynthesis, getContext: () => contexts[0] };
}

describe("game sound", () => {
  it("unlocks on player interaction and plays feedback after a suspended context resumes", async () => {
    const sound = setup();
    expect(sound.getContext()).toBeUndefined();
    sound.events.dispatchEvent(new Event("pointerdown"));
    sound.win.portalSound!.play("good");
    await vi.waitFor(() => expect(sound.start).toHaveBeenCalledTimes(2));
    expect(sound.getContext()!.resume).toHaveBeenCalledOnce();
  });

  it("mutes immediately, persists the choice, and cancels Spelling Snake speech", async () => {
    const sound = setup("math-army");
    sound.events.dispatchEvent(new Event("pointerdown"));
    await vi.waitFor(() => expect(sound.getContext()!.state).toBe("running"));
    sound.button.click();
    expect(sound.button.getAttribute("aria-pressed")).toBe("false");
    expect(sound.storage.get("portalSound:math-army")).toBe("off");
    sound.win.portalSound!.play("good");
    expect(sound.start).not.toHaveBeenCalled();
    sound.button.click();
    expect(sound.button.getAttribute("aria-pressed")).toBe("true");
    expect(sound.start).toHaveBeenCalledOnce();
    expect(setup("math-army", "off").button.getAttribute("aria-pressed")).toBe("false");
    const spelling = setup("spelling-snake");
    spelling.button.click();
    expect(spelling.speechSynthesis.cancel).toHaveBeenCalledOnce();
  });

  it("reports unavailable audio instead of claiming playback succeeded", () => {
    const sound = setup();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    sound.win.AudioContext = undefined as never;
    sound.events.dispatchEvent(new Event("keydown"));
    expect(log).toHaveBeenCalled();
    expect(sound.button.nextElementSibling?.textContent).toContain("Sound is unavailable");
    log.mockRestore();
  });
});
