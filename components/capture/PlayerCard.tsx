"use client";

import { IconPause, IconPlay } from "@/components/icons/ListenerIcons";
import { formatTime, sanitizeSeconds } from "@/lib/format";
import { useCallback, useEffect, useRef, useState } from "react";

type PlayerCardProps = {
  audioUrl: string;
  durationSeconds?: number;
};

/** Mockup `.player-card` — centered play control + scrubber. */
const PlayerCard = ({ audioUrl, durationSeconds }: PlayerCardProps) => {
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
      const meta = sanitizeSeconds(audio.duration);
      setDuration(meta > 0 ? meta : sanitizeSeconds(durationSeconds ?? 0));
    };

    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", () =>
      setCurrentTime(sanitizeSeconds(audio.currentTime))
    );
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.pause();
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

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="flex w-full max-w-[330px] flex-col items-center rounded-2xl border border-border bg-surface px-6 pt-[26px] pb-[22px] shadow-card">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-gold bg-surface text-gold shadow-record"
      >
        {isPlaying ? (
          <IconPause size={26} className="text-gold" />
        ) : (
          <IconPlay size={26} className="text-gold" />
        )}
      </button>

      <div className="relative mt-[26px] mb-3 h-1 w-full rounded-full bg-gold/20">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gold"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-4 ring-gold-15"
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="flex w-full justify-between text-xs tabular-nums text-muted">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default PlayerCard;
