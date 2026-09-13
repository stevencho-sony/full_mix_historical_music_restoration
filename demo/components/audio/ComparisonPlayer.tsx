"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioCondition } from "@/types/audio";
import { usePlayback } from "./PlaybackProvider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function ComparisonPlayer({ playerId, conditions }: { playerId: string; conditions: AudioCondition[] }) {
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [selected, setSelected] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { claimPlayback, releasePlayback } = usePlayback();

  const pause = useCallback(() => {
    audioRefs.current.forEach((audio) => audio?.pause());
    setPlaying(false);
  }, []);

  useEffect(() => () => releasePlayback(playerId), [playerId, releasePlayback]);

  const play = useCallback(async () => {
    const audio = audioRefs.current[selected];
    if (!audio) return;
    setError(null);
    setLoading(audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);
    claimPlayback(playerId, pause);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setLoading(false);
      setError("Playback could not start. Try again after the audio loads.");
    }
  }, [claimPlayback, pause, playerId, selected]);

  const togglePlayback = useCallback(() => {
    if (playing) {
      pause();
      releasePlayback(playerId);
    } else {
      void play();
    }
  }, [pause, play, playing, playerId, releasePlayback]);

  const switchCondition = useCallback(
    async (index: number) => {
      if (index === selected) return;
      const oldAudio = audioRefs.current[selected];
      const nextAudio = audioRefs.current[index];
      const position = oldAudio?.currentTime ?? currentTime;
      const shouldResume = playing;
      oldAudio?.pause();
      setSelected(index);
      setError(null);
      if (!nextAudio) return;

      const resume = async () => {
        nextAudio.currentTime = Math.min(position, Number.isFinite(nextAudio.duration) ? nextAudio.duration : position);
        nextAudio.volume = volume;
        setCurrentTime(nextAudio.currentTime);
        if (shouldResume) {
          claimPlayback(playerId, pause);
          try {
            await nextAudio.play();
            setPlaying(true);
          } catch {
            setPlaying(false);
            setError("This version is not ready yet. Please try again.");
          }
        }
      };

      if (nextAudio.readyState >= HTMLMediaElement.HAVE_METADATA) await resume();
      else nextAudio.addEventListener("loadedmetadata", () => void resume(), { once: true });
    },
    [claimPlayback, currentTime, pause, playerId, playing, selected, volume],
  );

  const seek = (value: number) => {
    const audio = audioRefs.current[selected];
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const changeVolume = (value: number) => {
    setVolume(value);
    audioRefs.current.forEach((audio) => {
      if (audio) audio.volume = value;
    });
  };

  return (
    <div
      className="comparison-player"
      aria-label="Synchronized audio comparison"
      onKeyDown={(event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
        if (event.code === "Space") {
          event.preventDefault();
          togglePlayback();
        }
        if (event.code === "ArrowLeft") seek(Math.max(0, currentTime - 2));
        if (event.code === "ArrowRight") seek(Math.min(duration, currentTime + 2));
      }}
      tabIndex={0}
    >
      <div className="condition-tabs" role="group" aria-label="Audio condition">
        {conditions.map((condition, index) => (
          <button
            className={`condition-tab ${index === selected ? "active" : ""} ${condition.isOurs ? "ours" : ""}`}
            key={condition.id}
            type="button"
            aria-pressed={index === selected}
            onClick={() => void switchCondition(index)}
          >
            {condition.shortLabel}
            {condition.isOurs && <span className="ours-tag">Ours</span>}
          </button>
        ))}
      </div>

      <div className="transport-row">
        <button className="play-button" type="button" onClick={togglePlayback} aria-label={playing ? "Pause audio" : "Play audio"}>
          {playing ? <Pause aria-hidden="true" size={18} /> : <Play aria-hidden="true" size={18} fill="currentColor" />}
        </button>
        <span className="timecode">{formatTime(currentTime)}</span>
        <input
          className="timeline"
          aria-label="Audio position"
          type="range"
          min={0}
          max={duration || 5}
          step={0.01}
          value={Math.min(currentTime, duration || 5)}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <span className="timecode">{formatTime(duration)}</span>
        <label className="volume-control">
          <Volume2 aria-hidden="true" size={17} />
          <span className="sr-only">Volume</span>
          <input aria-label="Volume" type="range" min={0} max={1} step={0.05} value={volume} onChange={(event) => changeVolume(Number(event.target.value))} />
        </label>
      </div>

      <div className="player-status" aria-live="polite">
        {loading && !error ? "Loading audio…" : error}
      </div>

      {conditions.map((condition, index) => (
        <audio
          key={condition.id}
          ref={(element) => { audioRefs.current[index] = element; }}
          src={condition.src}
          preload="metadata"
          onLoadedMetadata={(event) => {
            event.currentTarget.volume = volume;
            if (index === selected) setDuration(event.currentTarget.duration);
          }}
          onTimeUpdate={(event) => { if (index === selected) setCurrentTime(event.currentTarget.currentTime); }}
          onCanPlay={() => { if (index === selected) setLoading(false); }}
          onWaiting={() => { if (index === selected) setLoading(true); }}
          onPlaying={() => { if (index === selected) { setLoading(false); setPlaying(true); } }}
          onPause={() => { if (index === selected) setPlaying(false); }}
          onEnded={() => { if (index === selected) { setPlaying(false); setCurrentTime(0); releasePlayback(playerId); } }}
          onError={() => { if (index === selected) { setLoading(false); setPlaying(false); setError("Audio example unavailable."); } }}
        />
      ))}
    </div>
  );
}
