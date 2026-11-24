import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubjectPage from "@/app/learn/[subject]/page";
import EcosystemIslandPage from "@/app/learn/science/ecosystem-island/page";
import FractionFactoryPage from "@/app/learn/math/fraction-factory/page";
import TypingNinjaPage from "@/app/learn/reading/typing-ninja/page";
import TimeTravelerPage from "@/app/learn/science/time-traveler/page";
import MapQuestPage from "@/app/learn/science/map-quest/page";
import PlanetHopperPage from "@/app/learn/science/planet-hopper/page";
import { GET as ecosystem } from "@/app/learn/science/ecosystem-island/play/route";
import { GET as fraction } from "@/app/learn/math/fraction-factory/play/route";
import { GET as typing } from "@/app/learn/reading/typing-ninja/play/route";
import { GET as time } from "@/app/learn/science/time-traveler/play/route";
import { GET as map } from "@/app/learn/science/map-quest/play/route";
import { GET as planet } from "@/app/learn/science/planet-hopper/play/route";
import nextConfig from "../../next.config";

const mocks = vi.hoisted(() => ({ user: vi.fn(), auth: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, redirect: () => { throw new Error("REDIRECT"); } }));
beforeEach(() => { mocks.user.mockResolvedValue({ id: "google:owner" }); mocks.auth.mockResolvedValue({ user: { id: "google:owner" } }); });

const games = [
  { name: "Planet Hopper", subject: "science", slug: "planet-hopper", page: PlanetHopperPage, get: planet, menu: '<button id="startBtn">Start exploring</button>', marker: "Solar System Explorer", existing: "Play Map Quest" },
  { name: "Map Quest", subject: "science", slug: "map-quest", page: MapQuestPage, get: map, menu: '<button id="play">Choose a quiz</button>', marker: "mapquest-v1", existing: "Play Time Traveler" },
  { name: "Time Traveler", subject: "science", slug: "time-traveler", page: TimeTravelerPage, get: time, menu: '<button id="play">Play</button>', marker: "timeTraveler_progress_v1", existing: "Play Ecosystem Island" },
  { name: "Ecosystem Island", subject: "science", slug: "ecosystem-island", page: EcosystemIslandPage, get: ecosystem, menu: '<button data-start="1">Play</button>', marker: "ecoIsland.v1.", existing: null },
  { name: "Fraction Factory", subject: "math", slug: "fraction-factory", page: FractionFactoryPage, get: fraction, menu: '<button id="playBtn">Play</button>', marker: "fractionFactorySave", existing: "Play Math Army" },
  { name: "Typing Ninja", subject: "reading", slug: "typing-ninja", page: TypingNinjaPage, get: typing, menu: '<button data-a="play">Play</button>', marker: "typingNinja", existing: "Play Spelling Snake" },
];

describe.each(games)("$name integration", (game) => {
  const route = `/learn/${game.subject}/${game.slug}`;
  it("appears in the requested subject without replacing grade navigation or existing games", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: game.subject }) }));
    expect(screen.getByRole("link", { name: `Play ${game.name}` })).toHaveAttribute("href", route);
    expect(screen.getAllByRole("link", { name: /^Grade [1-8] / })).toHaveLength(8);
    if (game.existing) expect(screen.getByRole("link", { name: game.existing })).toBeInTheDocument();
  });
  it("does not appear in another subject", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: game.subject === "math" ? "reading" : "math" }) }));
    expect(screen.queryByRole("link", { name: `Play ${game.name}` })).not.toBeInTheDocument();
  });
  it("recognizes the real initial menu and restarts the protected iframe", async () => {
    render(await game.page());
    const frame = screen.getByTitle<HTMLIFrameElement>(`${game.name}: interactive learning game`);
    expect(frame).toHaveAttribute("src", `${route}/play`);
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = `<canvas></canvas><div id="card">${game.menu}</div>`;
    Object.defineProperty(frame, "contentDocument", { value: doc });
    fireEvent.load(frame);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Restart game" }));
    expect(screen.getByTitle(`${game.name}: interactive learning game`)).not.toBe(frame);
    expect(screen.getByRole("status")).toHaveTextContent(`Loading ${game.name}`);
  });
  it("serves the imported game privately without external graphics requests", async () => {
    const response = await game.get();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("content-security-policy")).toContain(`connect-src '${game.slug === "planet-hopper" ? "none" : "self"}'`);
    const html = await response.text();
    expect(html).toContain(game.marker);
    expect(html).toContain("/games/vendor/three-0.160.0/three.module.js");
    expect(html).not.toMatch(/<script[^>]+src=["']https?:\/\//);
    if (game.slug !== "map-quest" && game.slug !== "planet-hopper") expect(html).not.toMatch(/https?:\/\//);
  });

  it("keeps learning entries protected, serves public gameplay and traces only the exact framing exception", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(game.page()).rejects.toThrow("AUTH_REDIRECT");
    mocks.auth.mockResolvedValueOnce(null);
    expect((await game.get()).status).toBe(200);
    expect(nextConfig.outputFileTracingIncludes?.[`${route}/play`]).toEqual([`./src/games/${game.slug}/index.html`]);
    const rules = await nextConfig.headers!();
    expect(rules.find(rule => rule.source === `${route}/play`)?.headers).toContainEqual({ key: "X-Frame-Options", value: "SAMEORIGIN" });
    expect(rules.find(rule => rule.source === "/(.*)")?.headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
});

it("Map Quest resolves all bundled images locally and preserves their attribution", async () => {
  const html = await (await map()).text();
  for (const asset of ["earth-texture", "country-borders", "wikipedia-descriptions", "place-media"]) {
    expect(html).toContain(`/games/map-quest/assets/${asset}.js`);
    await access(path.join(process.cwd(), "public", "games", "map-quest", "assets", `${asset}.js`));
  }
  expect(html).toContain("image.src='/games/map-quest/'+media.src");
  const context: { window: { mapQuestMedia?: { places: Record<string, { src?: string; filePage?: string; license?: string; licenseUrl?: string }> } } } = { window: {} };
  runInNewContext(await readFile(path.join(process.cwd(), "public", "games", "map-quest", "assets", "place-media.js"), "utf8"), context);
  const media = context.window.mapQuestMedia;
  if (!media) throw new Error("Bundled Map Quest media metadata is missing");
  const images = Object.values(media.places).filter(item => item.src);
  expect(images.length).toBeGreaterThan(0);
  await Promise.all(images.map(async (item) => {
    const src = item.src;
    if (!src) throw new Error("Map Quest image path is missing");
    expect(src).toMatch(/^\.\/assets\/media\/[\w-]+\.(png|jpg)$/);
    expect(item.filePage).toMatch(/^https:\/\/commons.wikimedia.org\//);
    expect(item.license).toBeTruthy();
    expect(item.licenseUrl).toMatch(/^https?:\/\//);
    await access(path.join(process.cwd(), "public", "games", "map-quest", src));
  }));
});

it("Planet Hopper bundles its module assets and confines optional reference photos to its own policy", async () => {
  const response = await planet();
  const html = await response.text();
  expect(html).toContain('href="/games/planet-hopper/explorer.css"');
  expect(html).toContain('src="/games/planet-hopper/explorer.js"');
  for (const file of ["explorer.js", "explorer.css", "object-details.js", "object-images.js", ...["earth", "mercury", "mars", "jupiter", "moon"].map(name => `textures/${name}.jpg`)]) {
    await access(path.join(process.cwd(), "public", "games", "planet-hopper", file));
  }
  expect(response.headers.get("content-security-policy")).toContain("style-src 'self' 'unsafe-inline'");
  expect(response.headers.get("content-security-policy")).toContain("https://thumb.wikimedia.org https://upload.wikimedia.org");
  expect((await map()).headers.get("content-security-policy")).not.toContain("wikimedia.org");
  expect(html).toContain("Choose Load reference image");
});
