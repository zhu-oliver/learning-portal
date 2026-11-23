import { readFile } from "node:fs/promises";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MathKartPage from "./page";
import { GET } from "./play/route";
import SubjectPage from "../../[subject]/page";

const mocks = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, redirect: () => { throw new Error("REDIRECT"); } }));
beforeEach(() => mocks.user.mockResolvedValue({ id: "google:owner" }));

describe("Math Kart integration", () => {
  it("lists both games without replacing mental mathematics or grade navigation", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: "math" }) }));
    expect(screen.getByRole("link", { name: "Play Math Kart" })).toHaveAttribute("href", "/learn/math/math-kart");
    expect(screen.getByRole("link", { name: "Play Math Army" })).toHaveAttribute("href", "/learn/math/math-army");
    expect(screen.getByRole("link", { name: "Explore Mental Mathematics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose your grade" })).toBeInTheDocument();
  });
  it("opens the shared player and validates Kart's menu instead of expecting Army buttons", async () => {
    render(await MathKartPage());
    expect(screen.getByRole("heading", { name: "Math Kart" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Math" })).toHaveAttribute("href", "/learn/math");
    expect(screen.getByText(/two-player split screen/)).toBeInTheDocument();
    const frame = screen.getByTitle<HTMLIFrameElement>("Math Kart: interactive learning game");
    expect(frame).toHaveAttribute("src", "/learn/math/math-kart/play");
    const gameDocument = document.implementation.createHTMLDocument();
    gameDocument.body.innerHTML = '<canvas></canvas><button class="lv">Meadow Loop</button>';
    Object.defineProperty(frame, "contentDocument", { value: gameDocument });
    fireEvent.load(frame);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Restart game" }));
    expect(screen.getByTitle("Math Kart: interactive learning game")).not.toBe(frame);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Math Kart");
  });
  it("accepts progress feedback only from the active same-origin iframe and exposes retry safely", async () => {
    render(await MathKartPage());
    const frame = screen.getByTitle<HTMLIFrameElement>("Math Kart: interactive learning game");
    const source = frame.contentWindow;
    const data = { type: "little-oak-progress", state: "error", message: "SQL unavailable" };
    fireEvent(window, new MessageEvent("message", { source, origin: "https://other.example", data }));
    fireEvent(window, new MessageEvent("message", { source: window, origin: window.location.origin, data }));
    expect(screen.queryByText("SQL unavailable")).not.toBeInTheDocument();
    fireEvent(window, new MessageEvent("message", { source, origin: window.location.origin, data }));
    expect(screen.getByRole("alert")).toHaveTextContent("SQL unavailable");
    expect(screen.getByRole("button", { name: "Restart game" })).toBeDisabled();
    const post = vi.spyOn(source!, "postMessage");
    await userEvent.setup().click(screen.getByRole("button", { name: "Retry saving" }));
    expect(post).toHaveBeenCalledWith({ type: "little-oak-progress-command", action: "retry" }, window.location.origin);
    fireEvent(window, new MessageEvent("message", { source, origin: window.location.origin, data: { ...data, state: "saved", message: "Saved" } }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Restart game" }));
    fireEvent(window, new MessageEvent("message", { source, origin: window.location.origin, data }));
    expect(screen.queryByText("SQL unavailable")).not.toBeInTheDocument();
  });
  it("serves the original eight-track game privately with its matching self-hosted addon", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("content-security-policy")).toContain("connect-src 'self'");
    const game = await response.text();
    expect(game).not.toContain("cdn.jsdelivr.net");
    expect(game).toContain("/games/math-army/vendor/");
    expect(game).toContain("RoundedBoxGeometry");
    expect(game).toContain("Champion Circuit");
    expect(game).toContain("mathKartStars");
    expect(game).toContain("mathKartPlayers");
    expect(game).not.toContain("mathArmyStars");
    const addon = await readFile(path.join(process.cwd(), "public", "games", "math-army", "vendor", "geometries", "RoundedBoxGeometry.js"), "utf8");
    expect(addon).toContain("from 'three'");
  });
  it("keeps both the page and raw game behind login", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(MathKartPage()).rejects.toThrow("AUTH_REDIRECT");
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(GET()).rejects.toThrow("AUTH_REDIRECT");
  });
});
