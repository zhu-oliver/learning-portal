import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ScienceVideos } from "./science-videos";
import type { ScienceVideo } from "@/modules/videos/types";

const video: ScienceVideo = {
  videoId: "abcdefghijk", title: "Water moves", channel: "Example educator",
  durationSeconds: 185, learningFocus: "Follow evaporation and condensation.",
  question: "Where does water go after rain?", verifiedAt: "2026-10-11",
};

describe("optional Science video player", () => {
  it("does not load any external media before explicit consent and keeps its fallback link", () => {
    const { container } = render(<ScienceVideos videos={[video]} />);
    expect(screen.getByRole("region", { name: "Extend your knowledge" })).toBeInTheDocument();
    expect(container.querySelectorAll("iframe,img,video,source")).toHaveLength(0);
    expect(screen.getByText("Example educator · 3:05")).toBeInTheDocument();
    expect(screen.getByText(video.learningFocus)).toBeInTheDocument();
    expect(screen.getByText(video.question)).toBeInTheDocument();
    expect(screen.getByText(/Watching and reflecting are optional/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Watch Water moves on YouTube/ });
    expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=abcdefghijk");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("loads a titled nocookie player without autoplay; closing removes it and restores focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<ScienceVideos videos={[video]} />);
    await user.click(screen.getByRole("button", { name: "Load YouTube video: Water moves" }));
    const player = screen.getByTitle("Water moves — Example educator");
    expect(player).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0");
    expect(player).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(player.getAttribute("allow")).not.toContain("autoplay");
    expect(player).toHaveAttribute("allowfullscreen");
    await user.click(screen.getByRole("button", { name: "Close video" }));
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: /Load YouTube video/ })).toHaveFocus());
  });

  it("keeps separate videos independent and unmount removes players", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(<ScienceVideos videos={[video, { ...video, videoId: "zyxwvutsrqp", title: "Cloud clues" }]} />);
    const cards = screen.getAllByRole("article");
    await user.click(within(cards[0]).getByRole("button"));
    expect(cards[0].querySelector("iframe")).toBeInTheDocument();
    expect(cards[1].querySelector("iframe")).not.toBeInTheDocument();
    unmount();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("keeps explicit unavailable-player guidance, fallback and retry accessible after loading", async () => {
    const user = userEvent.setup();
    render(<ScienceVideos videos={[video]} />);
    await user.click(screen.getByRole("button", { name: /Load YouTube video/ }));
    expect(screen.getByText(/If embedding is blocked or the video is unavailable here/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch Water moves on YouTube/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close video" }));
    await user.click(screen.getByRole("button", { name: /Load YouTube video/ }));
    expect(screen.getByTitle("Water moves — Example educator")).toBeInTheDocument();
  });
});
