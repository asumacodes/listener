"use client";

import { formatTime, sanitizeSeconds } from "@/lib/format";
import { useCallback, useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  audioUrl: string;
  /** Timer duration from recording — fallback when blob metadata is Infinity/NaN (common for webm). */
  durationSeconds?: number;
  /** Inline scrubber + `current / total` — desktop idea header. */
  variant?: "default" | "compact";
};

const resolveDuration = (
  metadataDuration: number,
  fallbackSeconds?: number
): number => {
  const fromMeta = sanitizeSeconds(metadataDuration);
  if (fromMeta > 0) return fromMeta;
  return sanitizeSeconds(fallbackSeconds ?? 0);
};

const AudioPlayer = ({
  audioUrl,
  durationSeconds,
  variant = "default",
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() =>
    sanitizeSeconds(durationSeconds ?? 0)
  );

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const syncDuration = () => {
      setDuration(resolveDuration(audio.duration, durationSeconds));
    };

    const onTimeUpdate = () =>
      setCurrentTime(sanitizeSeconds(audio.currentTime));
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [audioUrl, durationSeconds]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const compact = variant === "compact";

  const playButton = (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={isPlaying ? "Pause" : "Play"}
      className={
        compact
          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-10 text-gold transition hover:bg-gold-15"
          : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-white transition-opacity hover:opacity-90"
      }
    >
      {isPlaying ? (
        <span className="flex gap-0.5" aria-hidden="true">
          <span
            className={`block rounded-sm ${compact ? "h-3 w-0.5 bg-gold" : "h-3.5 w-1 bg-white"}`}
          />
          <span
            className={`block rounded-sm ${compact ? "h-3 w-0.5 bg-gold" : "h-3.5 w-1 bg-white"}`}
          />
        </span>
      ) : (
        <span
          className={
            compact
              ? "ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-gold"
              : "ml-0.5 block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white"
          }
          aria-hidden="true"
        />
      )}
    </button>
  );

  const scrubber = (
    <div
      className={`min-w-0 ${compact ? "flex flex-1 items-center gap-3" : "flex-1"}`}
    >
      <div
        className={`relative flex items-center ${compact ? "h-3 min-w-0 flex-1" : "h-4"}`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 rounded-full ${
            compact ? "h-[3px] bg-border" : "h-1 bg-gold/20"
          }`}
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gold`}
            style={{ width: `${progress}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ${
              compact
                ? "h-2.5 w-2.5 shadow-[0_0_0_4px_var(--gold-10)]"
                : "h-2.5 w-2.5 ring-4 ring-gold-15"
            }`}
            style={{ left: `${progress}%` }}
            aria-hidden
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          step="any"
          value={Math.min(currentTime, duration > 0 ? duration : 0)}
          onChange={(e) => handleSeek(Number(e.target.value))}
          disabled={duration <= 0}
          aria-label="Playback position"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
      {compact ? (
        <span className="shrink-0 text-[11px] tabular-nums text-muted">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      ) : (
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="flex w-[min(100%,380px)] shrink items-center gap-3.5 rounded-full border border-border bg-surface px-4 py-2.5">
        {playButton}
        {scrubber}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {playButton}
      {scrubber}
    </div>
  );
};

export default AudioPlayer;
