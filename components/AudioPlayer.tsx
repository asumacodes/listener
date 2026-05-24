"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/format";

type AudioPlayerProps = {
  audioUrl: string;
};

const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onLoaded = () => setDuration(Math.floor(audio.duration) || 0);
    const onTimeUpdate = () => setCurrentTime(Math.floor(audio.currentTime));
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [audioUrl]);

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
    if (!audio) return;
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
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-primary text-white transition-opacity hover:opacity-90"
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
          max={duration || 0}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          aria-label="Playback position"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gold-primary/20 accent-gold-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary/50"
          style={{
            background: `linear-gradient(to right, var(--gold-primary) ${progress}%, rgba(197,163,104,0.2) ${progress}%)`,
          }}
        />
        <div className="mt-1.5 flex justify-between text-xs text-text-muted">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
