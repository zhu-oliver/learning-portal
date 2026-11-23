import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionAudio } from "./section-audio";

describe("section read-aloud", () => {
  let voiceEvents: EventTarget;
  beforeEach(() => {
    voiceEvents = new EventTarget();
    vi.stubGlobal("speechSynthesis", {
      speak: vi.fn(), cancel: vi.fn(),
      getVoices: vi.fn(() => [{ name: "Canadian English", lang: "en-CA" }]),
      addEventListener: vi.fn(voiceEvents.addEventListener.bind(voiceEvents)),
      removeEventListener: vi.fn(voiceEvents.removeEventListener.bind(voiceEvents)),
    });
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string;
      constructor(text: string) { this.text = text; }
    });
  });
  afterEach(() => vi.useRealTimers());

  it("uses a compact icon with an accessible label and tooltip, without repeated helper text", async () => {
    const user = userEvent.setup();
    render(<SectionAudio heading="Fractions" body="Equal parts." />);
    const button = screen.getByRole("button", { name: "Read section: Fractions" });
    expect(button).toHaveAttribute("title", "Read section: Fractions");
    expect(button).toHaveClass("audio-icon-button");
    expect(button.textContent).toBe("");
    expect(screen.queryByText(/Reads the explanation/)).not.toBeInTheDocument();
    expect(screen.queryByText(/voice service may process/)).not.toBeInTheDocument();
    await user.click(button);
    expect(screen.getByRole("button", { name: "Stop reading Fractions" }).textContent).toBe("");
  });

  describe("voice initialization", () => {
    it.each(["en", "fr"] as const)("plays on the first click once delayed %s voices load", (language) => {
      vi.useFakeTimers();
      const voices = window.speechSynthesis.getVoices();
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([]);
      render(<SectionAudio heading="patient" body="" language={language} pronunciation />);
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
      expect(screen.getByRole("status")).toHaveTextContent(language === "fr" ? "Chargement" : "Loading voice");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(200);
        vi.mocked(window.speechSynthesis.getVoices).mockReturnValue(language === "en" ? voices : [{ ...voices[0], lang: "fr-CA" }]);
        voiceEvents.dispatchEvent(new Event("voiceschanged"));
      });
      expect(window.speechSynthesis.speak).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "patient", lang: `${language}-CA` }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(window.speechSynthesis.removeEventListener).toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("reports a genuinely empty voice list only after the bounded loading wait", () => {
      vi.useFakeTimers();
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([]);
      render(<SectionAudio heading="patient" body="" pronunciation />);
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
      act(() => vi.advanceTimersByTime(2999));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByRole("alert")).toHaveTextContent("English voice is not available");
      expect(screen.getByRole("button", { name: "Hear pronunciation: patient" })).toBeInTheDocument();
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("rechecks loaded voices at the timeout if the browser omits voiceschanged", () => {
      vi.useFakeTimers();
      const voices = window.speechSynthesis.getVoices();
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([]);
      render(<SectionAudio heading="patient" body="" pronunciation />);
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue(voices);
      act(() => vi.advanceTimersByTime(3000));
      expect(window.speechSynthesis.speak).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "patient" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("cancels pending pronunciation on stop or unmount without delayed playback", () => {
      vi.useFakeTimers();
      const voices = window.speechSynthesis.getVoices();
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([]);
      const { unmount } = render(<SectionAudio heading="patient" body="" pronunciation />);
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
      fireEvent.click(screen.getByRole("button", { name: "Stop pronunciation: patient" }));
      expect(vi.getTimerCount()).toBe(0);
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
      unmount();
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue(voices);
      act(() => {
        voiceEvents.dispatchEvent(new Event("voiceschanged"));
        vi.advanceTimersByTime(3000);
      });
      expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("starts only the most recently requested word when voices load", () => {
      vi.useFakeTimers();
      const voices = window.speechSynthesis.getVoices();
      vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([]);
      render(<><SectionAudio heading="patient" body="" pronunciation /><SectionAudio heading="obedient" body="" pronunciation /></>);
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
      fireEvent.click(screen.getByRole("button", { name: "Hear pronunciation: obedient" }));
      expect(screen.getByRole("button", { name: "Hear pronunciation: patient" })).toBeInTheDocument();
      act(() => {
        vi.mocked(window.speechSynthesis.getVoices).mockReturnValue(voices);
        voiceEvents.dispatchEvent(new Event("voiceschanged"));
      });
      expect(window.speechSynthesis.speak).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ text: "obedient" }));
    });
  });

  it("reads only the section explanation and activity, stops, and stops on unmount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SectionAudio heading="Fractions" body="Equal parts." activity="Draw a strip." />);
    await user.click(screen.getByRole("button", { name: "Read section: Fractions" }));
    expect(window.speechSynthesis.speak).toHaveBeenCalledWith(expect.objectContaining({
      text: "Fractions. Equal parts. Guided activity. Draw a strip.", lang: "en-CA", rate: .9,
    }));
    await user.click(screen.getByRole("button", { name: "Stop reading Fractions" }));
    expect(screen.getByRole("button", { name: "Read section: Fractions" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Read section: Fractions" }));
    const cancellations = vi.mocked(window.speechSynthesis.cancel).mock.calls.length;
    unmount();
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(cancellations + 1);
  });

  it("allows only one section to read at a time", async () => {
    const user = userEvent.setup();
    render(<><SectionAudio heading="First" body="First body." /><SectionAudio heading="Second" body="Second body." /></>);
    await user.click(screen.getByRole("button", { name: "Read section: First" }));
    await user.click(screen.getByRole("button", { name: "Read section: Second" }));
    expect(screen.getByRole("button", { name: "Read section: First" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop reading Second" })).toBeInTheDocument();
  });

  it("pronounces only the requested word and stops the previous word", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<>
      <SectionAudio heading="patient" body="" pronunciation />
      <SectionAudio heading="obedient" body="" pronunciation />
    </>);
    await user.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
    expect(window.speechSynthesis.speak).toHaveBeenLastCalledWith(expect.objectContaining({ text: "patient", lang: "en-CA", rate: .9 }));
    await user.click(screen.getByRole("button", { name: "Hear pronunciation: obedient" }));
    expect(screen.getByRole("button", { name: "Hear pronunciation: patient" })).toBeInTheDocument();
    expect(window.speechSynthesis.speak).toHaveBeenLastCalledWith(expect.objectContaining({ text: "obedient" }));
    const utterance = vi.mocked(window.speechSynthesis.speak).mock.calls.at(-1)![0];
    act(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent));
    expect(await screen.findByRole("button", { name: "Hear pronunciation: obedient" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hear pronunciation: patient" }));
    const cancellations = vi.mocked(window.speechSynthesis.cancel).mock.calls.length;
    unmount();
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(cancellations + 1);
  });

  it("reports missing support and voices without using an unrelated language", async () => {
    const user = userEvent.setup();
    render(<SectionAudio heading="Sound" body="Vibrations." />);
    vi.mocked(window.speechSynthesis.getVoices).mockReturnValue([{ name: "French", lang: "fr-FR", default: false, localService: true, voiceURI: "test-french" }]);
    await user.click(screen.getByRole("button", { name: "Read section: Sound" }));
    expect(screen.getByRole("alert")).toHaveTextContent("English voice is not available");
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    vi.stubGlobal("speechSynthesis", undefined);
    await user.click(screen.getByRole("button", { name: "Read section: Sound" }));
    expect(screen.getByRole("alert")).toHaveTextContent("not supported");
  });

  it("reports a failed start explicitly and restores the read control", async () => {
    const user = userEvent.setup();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(window.speechSynthesis.speak).mockImplementation(() => { throw new Error("Device failure"); });
    render(<SectionAudio heading="Light" body="Reflection." />);
    await user.click(screen.getByRole("button", { name: "Read section: Light" }));
    expect(screen.getByRole("alert")).toHaveTextContent("could not start");
    expect(screen.getByRole("button", { name: "Read section: Light" })).toBeInTheDocument();
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
