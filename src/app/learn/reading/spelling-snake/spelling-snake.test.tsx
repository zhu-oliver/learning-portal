import { readFile } from "node:fs/promises";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SpellingSnakePage from "./page";
import { GET } from "./play/route";
import SubjectPage from "../../[subject]/page";
import nextConfig from "../../../../../next.config";

const mocks = vi.hoisted(() => ({ user: vi.fn(), auth: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, redirect: () => { throw new Error("REDIRECT"); } }));
beforeEach(() => { mocks.user.mockResolvedValue({ id: "google:owner" }); mocks.auth.mockResolvedValue({ user: { id: "google:owner" } }); });

describe("Spelling Snake integration", () => {
  it("adds English games without replacing vocabulary or grade navigation", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: "reading" }) }));
    expect(screen.getByRole("heading", { name: "English games" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Spelling Snake" })).toHaveAttribute("href", "/learn/reading/spelling-snake");
    expect(screen.getByRole("link", { name: "Explore vocabulary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose your grade" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Grade [1-8] / })).toHaveLength(8);
  });
  it("does not show the English game in Math", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: "math" }) }));
    expect(screen.queryByRole("link", { name: "Play Spelling Snake" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Math Army" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Math Kart" })).toBeInTheDocument();
  });
  it("opens and restarts the shared player with an appropriate accessible title", async () => {
    render(await SpellingSnakePage());
    expect(screen.getByRole("heading", { name: "Spelling Snake" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Language & Reading" })).toHaveAttribute("href", "/learn/reading");
    expect(screen.getByText(/voice service may process words remotely/)).toBeInTheDocument();
    const frame = screen.getByTitle<HTMLIFrameElement>("Spelling Snake: interactive learning game");
    expect(frame).toHaveAttribute("src", "/learn/reading/spelling-snake/play");
    const gameDocument = document.implementation.createHTMLDocument();
    gameDocument.body.innerHTML = '<canvas></canvas><button class="lvbtn">Little Words</button>';
    Object.defineProperty(frame, "contentDocument", { value: gameDocument });
    fireEvent.load(frame);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Restart game" }));
    expect(screen.getByTitle("Spelling Snake: interactive learning game")).not.toBe(frame);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Spelling Snake");
  });
  it("privately delivers seven spelling levels with only self-hosted dependencies", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("content-security-policy")).toContain("connect-src 'self'");
    const html = await response.text();
    expect(html).not.toMatch(/https?:\/\//);
    expect(html).toContain("/games/math-army/vendor/build/three.module.js");
    expect(html).toContain("Tricky Treasures");
    for (const key of ["spellingSnakeStars", "spellingSnakeLast", "spellingSnakeGfx"]) expect(html).toContain(key);
    expect(html).not.toContain("mathArmyStars");
    expect(html).not.toContain("mathKartStars");
    expect(html).toContain("speechSynthesis");
    const license = await readFile(path.join(process.cwd(), "public", "games", "math-army", "vendor", "LICENSE"), "utf8");
    expect(license).toContain("MIT License");
  });
  it("keeps both the page and raw game behind authentication", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(SpellingSnakePage()).rejects.toThrow("AUTH_REDIRECT");
    mocks.auth.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(200);
  });
  it("traces the private game and enables framing only for its exact play endpoint", async () => {
    expect(nextConfig.outputFileTracingIncludes?.["/learn/reading/spelling-snake/play"]).toEqual(["./src/games/spelling-snake/index.html"]);
    const rules = await nextConfig.headers!();
    expect(rules.find(rule => rule.source === "/(.*)")?.headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
    expect(rules.find(rule => rule.source === "/learn/reading/spelling-snake/play")?.headers).toContainEqual({ key: "X-Frame-Options", value: "SAMEORIGIN" });
  });
});
