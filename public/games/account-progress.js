(() => {
  "use strict";
  const { game, progress: initial, spec, ownerToken } = window.__portalProgress;
  const native = window.localStorage;
  let progress = { ...initial, stars: Array.from({ length: spec.levels }, (_, index) => initial.stars[index] ?? 0) };
  if (spec.coins) progress.coins ??= 0;
  if (spec.bestField || spec.bestKey) progress.best ??= 0;
  if (spec.stamps) progress.stamps ??= [];
  let revision = 0, savedRevision = 0, saving = false, timer;
  let state = "loaded", message = "Progress loaded for your account.", reopenRequired = false;
  const keys = [spec.starKey, spec.containerKey, spec.bestKey, spec.lastKey].filter(Boolean);

  function notify(nextState, text) {
    state = nextState;
    message = text;
    window.parent.postMessage({
      type: "little-oak-progress", state, message, reopenRequired,
      legacyAvailable: keys.some(key => native.getItem(key) !== null),
    }, location.origin);
  }
  function container(value) {
    const result = { stars: value.stars };
    if (spec.coins) result.coins = value.coins || 0;
    if (spec.bestField) result[spec.bestField] = value.best || 0;
    if (spec.stamps) {
      result.stamps = value.stamps || [];
      result.unlocked = Math.min(spec.levels, Math.max(1, ...value.stars.map((stars, index) => stars ? index + 2 : 1)));
      let preferences = native.getItem("mapquest-gfx");
      if (!preferences) {
        try { preferences = JSON.parse(native.getItem(spec.containerKey) || "{}").gfx; }
        catch (cause) { console.warn("Old Map Quest graphics preferences could not be read:", cause); }
      }
      result.gfx = ["auto", "high", "low"].includes(preferences) ? preferences : "auto";
    }
    return result;
  }
  function read(key) {
    if (!keys.includes(key)) return native.getItem(key);
    if (key === spec.containerKey) return JSON.stringify(container(progress));
    if (key === spec.starKey) return JSON.stringify(spec.objectStars
      ? Object.fromEntries(progress.stars.map((stars, index) => [index + 1, stars]))
      : progress.stars);
    return String(key === spec.bestKey ? progress.best || 0 : progress.lastLevel || 0);
  }
  function update(key, raw) {
    const previous = JSON.stringify(progress);
    const value = JSON.parse(String(raw));
    const stars = values => Array.from({ length: Math.max(spec.levels, values.length) }, (_, index) => values[index] ?? 0);
    if (key === spec.starKey) progress.stars = spec.objectStars
      ? Array.from({ length: spec.levels }, (_, index) => value[index + 1] ?? 0) : stars(value);
    else if (key === spec.bestKey) progress.best = value;
    else if (key === spec.lastKey) progress.lastLevel = value;
    else {
      progress.stars = stars(value.stars || []);
      if (spec.coins) progress.coins = value.coins || 0;
      if (spec.bestField) progress.best = value[spec.bestField] || 0;
      if (spec.stamps) {
        progress.stamps = value.stamps || [];
        if (value.gfx) native.setItem("mapquest-gfx", value.gfx);
      }
    }
    return previous !== JSON.stringify(progress);
  }
  function changed() {
    revision++;
    notify("saving", "Saving progress to your account...");
    clearTimeout(timer);
    timer = setTimeout(flush, 400);
  }
  async function flush() {
    clearTimeout(timer);
    if (saving || savedRevision === revision || reopenRequired) return;
    saving = true;
    const sentRevision = revision;
    try {
      const response = await fetch("/api/game-progress", {
        method: "POST", credentials: "same-origin", keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, ownerToken, progress }),
      });
      const result = await response.json();
      if (!response.ok) {
        reopenRequired = [400, 401, 409].includes(response.status);
        throw new Error(result.error || "Game progress could not be saved.");
      }
      savedRevision = sentRevision;
      if (revision === sentRevision) {
        progress = result.progress;
        notify("saved", "Progress saved to your account.");
      }
    } catch (cause) {
      console.error("Account game progress save failed:", cause instanceof Error ? cause.message : "Unknown error");
      notify("error", cause instanceof Error ? cause.message : "Progress could not save. Keep the game open and retry.");
    } finally {
      saving = false;
      if (state !== "error" && revision !== savedRevision) timer = setTimeout(flush, 400);
    }
  }
  window.portalGameProgress = {
    getItem: read,
    setItem(key, value) {
      if (!keys.includes(key)) { native.setItem(key, value); return; }
      try { if (update(key, value)) changed(); }
      catch (cause) {
        console.error("Invalid game progress:", cause);
        reopenRequired = true;
        notify("error", "This game could not prepare its progress for saving. Reopen the game and try again.");
        throw cause;
      }
    },
    removeItem(key) {
      if (!keys.includes(key)) { native.removeItem(key); return; }
      update(key, key === spec.containerKey ? '{"stars":[]}' : key === spec.starKey ? (spec.objectStars ? "{}" : "[]") : "0");
      changed();
    },
  };
  window.addEventListener("message", event => {
    if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== "little-oak-progress-command") return;
    if (event.data.action === "status") notify(state, message);
    if (event.data.action === "retry" && !reopenRequired) { notify("saving", "Retrying account progress save..."); flush(); }
    if (event.data.action === "import") {
      try {
        for (const key of keys) { const value = native.getItem(key); if (value !== null) update(key, value); }
        changed();
      } catch (cause) {
        console.error("Legacy game progress import failed:", cause);
        notify("error", "The old browser progress is invalid and could not be imported.");
      }
    }
  });
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", event => {
    if (revision !== savedRevision && !reopenRequired) { event.preventDefault(); event.returnValue = ""; }
  });
})();
