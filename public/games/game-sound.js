(() => {
  "use strict";
  const game = document.documentElement.dataset.portalSoundGame;
  const key = `portalSound:${game}`;
  let enabled = true, context, master, button, status, resuming;
  try { enabled = localStorage.getItem(key) !== "off"; }
  catch (error) { console.warn("Sound preference could not be read:", error); }

  function report(error) {
    console.error("Game sound is unavailable:", error);
    if (status) status.textContent = "Sound is unavailable. Check your browser and device sound settings.";
  }
  function unlock() {
    if (!enabled || game === "spelling-snake") return;
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error("Web Audio is not supported");
        context = new AudioContext();
        master = context.createGain();
        master.connect(context.destination);
      }
      if (context.state === "suspended" && !resuming) {
        resuming = context.resume().catch(report).finally(() => { resuming = null; });
      }
    } catch (error) { report(error); }
  }
  function play(kind = "select") {
    if (!enabled || !context) return;
    if (context.state !== "running") {
      if (resuming) resuming.then(() => { if (context.state === "running") play(kind); });
      return;
    }
    const notes = { select: [540], good: [523, 784], bad: [260, 180], win: [523, 659, 784] }[kind];
    if (!notes) throw new Error(`Unknown game sound: ${kind}`);
    const now = context.currentTime;
    notes.forEach((frequency, index) => {
      const start = now + index * 0.09;
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);
      oscillator.connect(gain).connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.16);
    });
  }
  window.portalSound = { get enabled() { return enabled; }, play, report };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  document.addEventListener("DOMContentLoaded", () => {
    button = document.createElement("button");
    button.type = "button";
    const bottom = ["math-kart", "spelling-snake", "planet-hopper"].includes(game) ? 110 : 8;
    button.style.cssText = `position:fixed;bottom:${bottom}px;left:8px;z-index:2147483647;padding:8px 12px;border:2px solid #fff;border-radius:10px;background:#173c38;color:#fff;font:700 14px system-ui;cursor:pointer;touch-action:manipulation`;
    status = document.createElement("div");
    status.setAttribute("role", "status");
    status.style.cssText = `position:fixed;bottom:${bottom + 44}px;left:8px;z-index:2147483647;max-width:260px;background:#fff;color:#222;font:14px system-ui`;
    function update() {
      button.textContent = enabled ? "Sound on" : "Sound off";
      button.setAttribute("aria-label", "Game sound");
      button.setAttribute("aria-pressed", String(enabled));
    }
    button.addEventListener("click", () => {
      enabled = !enabled;
      try { localStorage.setItem(key, enabled ? "on" : "off"); }
      catch (error) { console.warn("Sound preference could not be saved:", error); }
      if (master) master.gain.value = enabled ? 1 : 0;
      if (!enabled && game === "spelling-snake" && window.speechSynthesis) window.speechSynthesis.cancel();
      status.textContent = "";
      update();
      if (enabled) {
        unlock();
        play();
      }
    });
    update();
    document.body.append(button, status);
  });
})();
