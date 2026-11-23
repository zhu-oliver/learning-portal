import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MathArmyGame } from "./math-army-game";

describe("Math Army player", () => {
  it("loads the protected game with an accessible title and fullscreen permission", () => {
    render(<MathArmyGame />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading Math Army");
    const frame = screen.getByTitle("Math Army: interactive learning game");
    expect(frame).toHaveAttribute("src", "/learn/math/math-army/play");
    expect(frame).toHaveAttribute("allowfullscreen");
  });
  it("checks initialization and restarts with a fresh iframe without clearing device stars", async () => {
    const user = userEvent.setup();
    render(<MathArmyGame />);
    const frame = screen.getByTitle<HTMLIFrameElement>("Math Army: interactive learning game");
    const gameDocument = document.implementation.createHTMLDocument();
    gameDocument.body.innerHTML = '<canvas></canvas><button class="lvbtn">Level 1</button>';
    Object.defineProperty(frame, "contentDocument", { value: gameDocument });
    fireEvent.load(frame);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    localStorage.setItem("mathArmyStars", "[3]");
    await user.click(screen.getByRole("button", { name: "Restart game" }));
    expect(screen.getByTitle("Math Army: interactive learning game")).not.toBe(frame);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(localStorage.getItem("mathArmyStars")).toBe("[3]");
    localStorage.removeItem("mathArmyStars");
  });
  it("shows initialization failures instead of claiming the game loaded", () => {
    render(<MathArmyGame />);
    const frame = screen.getByTitle("Math Army: interactive learning game");
    fireEvent.load(frame);
    expect(screen.getByRole("alert")).toHaveTextContent("WebGL and local storage");
  });
  it("reports unsupported fullscreen without preventing inline play", async () => {
    render(<MathArmyGame />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Fullscreen" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Fullscreen is not supported");
  });
  it("requests fullscreen on the game stage", async () => {
    render(<MathArmyGame />);
    const stage = screen.getByTitle("Math Army: interactive learning game").parentElement!;
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(stage, "requestFullscreen", { value: requestFullscreen });
    await userEvent.setup().click(screen.getByRole("button", { name: "Fullscreen" }));
    expect(requestFullscreen).toHaveBeenCalledOnce();
  });
});
