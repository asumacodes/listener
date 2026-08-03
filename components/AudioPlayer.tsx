"use client";

import { formatTime, sanitizeSeconds } from "@/lib/format";
import { useCallback, useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  audioUrl: string;
  /** Timer duration from recording — fallback when blob metadata is Infinity/NaN (common for webm). */
  durationSeconds?: number;
};

const resolveDuration = (
  metadataDuration: number,
  fallbackSeconds?: number
): number => {
  const fromMeta = sanitizeSeconds(metadataDuration);
  if (fromMeta > 0) return fromMeta;
  return sanitizeSeconds(fallbackSeconds ?? 0);
};

const AudioPlayer = ({ audioUrl, durationSeconds }: AudioPlayerProps) => {
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

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-white transition-opacity hover:opacity-90"
      >
        {isPlaying ? (
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="block h-3.5 w-1 rounded-sm bg-white" />
            <span className="block h-3.5 w-1 rounded-sm bg-white" />
          </span>
        ) : (
          <span
            className="ml-0.5 block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white"
            aria-hidden="true"
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          value={Math.min(currentTime, duration > 0 ? duration : 0)}
          onChange={(e) => handleSeek(Number(e.target.value))}
          disabled={duration <= 0}
          aria-label="Playback position"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gold/20 accent-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, var(--gold) ${progress}%, rgba(201,169,110,0.2) ${progress}%)`,
          }}
        />
        <div className="mt-1.5 flex justify-between text-xs text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
