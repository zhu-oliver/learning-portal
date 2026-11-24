import { readFile } from "node:fs/promises";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CodeCommanderPage from "./page";
import { GET } from "./play/route";
import SubjectPage from "../../[subject]/page";
import nextConfig from "../../../../../next.config";

const mocks = vi.hoisted(() => ({ user: vi.fn(), auth: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, redirect: () => { throw new Error("REDIRECT"); } }));
beforeEach(() => { mocks.user.mockResolvedValue({ id: "google:owner" }); mocks.auth.mockResolvedValue({ user: { id: "google:owner" } }); });

describe("Code Commander integration", () => {
  it("adds a third Math game without replacing existing activities", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: "math" }) }));
    expect(screen.getByRole("link", { name: "Play Code Commander" })).toHaveAttribute("href", "/learn/math/code-commander");
    expect(screen.getByRole("link", { name: "Play Math Army" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Math Kart" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Mental Mathematics" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Grade [1-8] / })).toHaveLength(8);
  });
  it("keeps Code Commander out of English games", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: "reading" }) }));
    expect(screen.queryByRole("link", { name: "Play Code Commander" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Spelling Snake" })).toBeInTheDocument();
  });
  it("recognizes the initial main menu and restarts with a fresh iframe", async () => {
    render(await CodeCommanderPage());
    expect(screen.getByRole("heading", { name: "Code Commander" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Math" })).toHaveAttribute("href", "/learn/math");
    expect(screen.getByText(/Programs are temporary/)).toBeInTheDocument();
    const frame = screen.getByTitle<HTMLIFrameElement>("Code Commander: interactive learning game");
    expect(frame).toHaveAttribute("src", "/learn/math/code-commander/play");
    const gameDocument = document.implementation.createHTMLDocument();
    gameDocument.body.innerHTML = '<canvas></canvas><button id="play">Choose a mission</button>';
    Object.defineProperty(frame, "contentDocument", { value: gameDocument });
    fireEvent.load(frame);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Restart game" }));
    expect(screen.getByTitle("Code Commander: interactive learning game")).not.toBe(frame);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Code Commander");
  });
  it("delivers the real coding game privately with its self-hosted graphics dependencies", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("content-security-policy")).toContain("connect-src 'self'");
    const html = await response.text();
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).toContain("/games/math-army/vendor/build/three.module.js");
    expect(html).toContain("RoundedBoxGeometry");
    expect(html).toContain("Grand Finale");
    expect(html).toContain("codeCommanderStars");
    expect(html).toContain("codeCommanderGfx");
    expect(html).not.toContain("mathArmyStars");
    expect(html).not.toContain("mathKartStars");
    const addon = await readFile(path.join(process.cwd(), "public", "games", "math-army", "vendor", "geometries", "RoundedBoxGeometry.js"), "utf8");
    expect(addon).toContain("from 'three'");
  });
  it("requires authentication for the entry page and direct game HTML", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(CodeCommanderPage()).rejects.toThrow("AUTH_REDIRECT");
    mocks.auth.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(200);
  });
  it("includes the private HTML in standalone deployments without opening framing broadly", async () => {
    expect(nextConfig.outputFileTracingIncludes?.["/learn/math/code-commander/play"]).toEqual(["./src/games/code-commander/index.html"]);
    const rules = await nextConfig.headers!();
    expect(rules.find(rule => rule.source === "/(.*)")?.headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
    expect(rules.find(rule => rule.source === "/learn/math/:game(math-army|math-kart|code-commander)/play")?.headers).toContainEqual({ key: "X-Frame-Options", value: "SAMEORIGIN" });
  });
});
