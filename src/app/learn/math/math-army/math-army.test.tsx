import { readFile } from "node:fs/promises";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MathArmyPage from "./page";
import { GET } from "./play/route";
import SubjectPage from "../../[subject]/page";

const mocks = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/game-progress", () => ({ loadGameProgress: vi.fn().mockResolvedValue({ stars: [] }), progressOwnerToken: () => "a".repeat(64) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); }, redirect: () => { throw new Error("REDIRECT"); } }));
beforeEach(() => mocks.user.mockResolvedValue({ id: "google:owner" }));

describe("Math Army integration", () => {
  it("adds the game to Math without replacing mental mathematics or grade navigation", async () => {
    render(await SubjectPage({ params: Promise.resolve({ subject: "math" }) }));
    expect(screen.getByRole("link", { name: "Play Math Army" })).toHaveAttribute("href", "/learn/math/math-army");
    expect(screen.getByRole("link", { name: "Explore Mental Mathematics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Choose your grade" })).toBeInTheDocument();
  });
  it("renders the protected play page with back navigation and device-storage disclosure", async () => {
    render(await MathArmyPage());
    expect(screen.getByRole("heading", { name: "Math Army" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Math" })).toHaveAttribute("href", "/learn/math");
    expect(screen.getByText(/Stars and last-played level save privately to your account in Azure SQL/)).toBeInTheDocument();
  });
  it("serves the real game privately with local-only dependencies and same-origin framing", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(response.headers.get("content-security-policy")).toContain("connect-src 'self'");
    const game = await response.text();
    expect(game).toContain("/games/math-army/vendor/build/three.module.js");
    expect(game).not.toContain("cdn.jsdelivr.net");
    expect(game).toContain("Math Master Fortress");
    const vendor = await readFile(path.join(process.cwd(), "public", "games", "math-army", "vendor", "build", "three.module.js"), "utf8");
    expect(vendor).toContain("170");
    expect(await readFile(path.join(process.cwd(), "public", "games", "math-army", "vendor", "LICENSE"), "utf8")).toContain("MIT License");
  });
  it("requires authentication for both the page and raw game endpoint", async () => {
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(MathArmyPage()).rejects.toThrow("AUTH_REDIRECT");
    mocks.user.mockRejectedValueOnce(new Error("AUTH_REDIRECT"));
    await expect(GET()).rejects.toThrow("AUTH_REDIRECT");
  });
});
