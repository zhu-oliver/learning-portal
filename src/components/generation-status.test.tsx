import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenerationStatus } from "./generation-status";

afterEach(() => vi.useRealTimers());

describe("AI generation status and estimated progress", () => {
  it("connects without starting the estimate, then fills to exactly 100% in 40 seconds and stays there", () => {
    vi.useFakeTimers();
    const { rerender } = render(<GenerationStatus status="queued" />);
    expect(screen.getByRole("status")).toHaveTextContent("Connecting to AI Model...");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60_000));
    rerender(<GenerationStatus status="processing" />);
    expect(screen.getByRole("status")).toHaveTextContent("Generating Lesson...");
    const bar = screen.getByRole("progressbar", { name: "Estimated lesson generation progress" });
    expect(bar).toHaveAttribute("value", "0");
    act(() => vi.advanceTimersByTime(20_000));
    expect(bar).toHaveAttribute("value", "50");
    rerender(<GenerationStatus status="processing" />);
    act(() => vi.advanceTimersByTime(19_750));
    expect(bar).toHaveAttribute("value", "99.375");
    act(() => vi.advanceTimersByTime(250));
    expect(bar).toHaveAttribute("value", "100");
    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(60_000));
    expect(bar).toHaveAttribute("value", "100");
    expect(screen.getByRole("status")).toHaveTextContent("Generating Lesson...");
    expect(bar).toHaveAttribute("aria-valuetext", "100% of the 40-second estimate; waiting for the lesson to finish");
  });
  it("stops timers on early completion and starts a fresh estimate for a new request", () => {
    vi.useFakeTimers();
    const { rerender, unmount } = render(<GenerationStatus key="first" status="processing" />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "25");
    rerender(<p>Lesson saved</p>);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    rerender(<GenerationStatus key="second" status="processing" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("resets the estimate if the request returns to connecting", () => {
    vi.useFakeTimers();
    const { rerender } = render(<GenerationStatus status="processing" />);
    act(() => vi.advanceTimersByTime(10_000));
    rerender(<GenerationStatus status="queued" />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    rerender(<GenerationStatus status="processing" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
  });
});
