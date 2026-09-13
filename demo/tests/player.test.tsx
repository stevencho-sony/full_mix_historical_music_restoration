import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComparisonPlayer } from "@/components/audio/ComparisonPlayer";
import { PlaybackProvider } from "@/components/audio/PlaybackProvider";

const conditions = [
  { id: "input", label: "Input", shortLabel: "Input", src: "/input.mp3" },
  { id: "ours", label: "Ours", shortLabel: "Ours", src: "/ours.mp3", isOurs: true },
];

describe("ComparisonPlayer", () => {
  it("exposes accessible transport and condition controls", () => {
    render(<PlaybackProvider><ComparisonPlayer playerId="one" conditions={conditions} /></PlaybackProvider>);
    expect(screen.getByRole("button", { name: "Play audio" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Audio position" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Input" })).toHaveAttribute("aria-pressed", "true");
  });

  it("changes condition without exposing multiple transport controls", () => {
    render(<PlaybackProvider><ComparisonPlayer playerId="two" conditions={conditions} /></PlaybackProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Ours Ours" }));
    expect(screen.getByRole("button", { name: "Ours Ours" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("button", { name: "Play audio" })).toHaveLength(1);
  });
});
