import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PublicGamesPage from "./page";
import PublicGamePage from "./[game]/page";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("@/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }));

describe("public games", () => {
  it("lists all ten games without a session and links to public game pages", () => {
    render(<PublicGamesPage />);
    expect(screen.getByRole("heading", { name: "Games" })).toBeInTheDocument();
    expect(screen.getByText(/no sign-in required/)).toBeInTheDocument();
    for (const name of ["Math Army", "Math Kart", "Code Commander", "Spelling Snake", "Ecosystem Island", "Time Traveler", "Map Quest", "Fraction Factory", "Typing Ninja", "Planet Hopper"]) {
      expect(screen.getByRole("heading", { name }).closest("a")).toHaveAttribute("href", `/games/${name.toLowerCase().replaceAll(" ", "-")}`);
    }
  });
  it.each(["math-army", "code-commander", "map-quest", "planet-hopper"])("serves public %s game entry without requesting authentication", async slug => {
    const page = await PublicGamePage({ params: Promise.resolve({ game: slug }) });
    render(page);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByTitle(/interactive learning game/)).toHaveAttribute("src", `/learn/${slug === "map-quest" || slug === "planet-hopper" ? "science" : "math"}/${slug}/play`);
    if (slug === "planet-hopper") expect(screen.getByText(/Planet Hopper is unsaved exploration/)).toBeInTheDocument();
    else expect(screen.getByText(/Sign in to save game progress/)).toBeInTheDocument();
  });
  it("rejects unknown game slugs", async () => {
    await expect(PublicGamePage({ params: Promise.resolve({ game: "not-a-game" }) })).rejects.toThrow("NOT_FOUND");
  });
});
