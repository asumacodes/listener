"use client";

import { IconPlay } from "@/components/icons/ListenerIcons";
import { formatDurationSeconds, formatTranscriptionDate } from "@/lib/format";
import { useRef, useState } from "react";

type RecordingStripProps = {
  signedUrl: string | null;
  durationSeconds: number;
  recordedAt: string;
};

const RecordingStrip = ({
  signedUrl,
  durationSeconds,
  recordedAt,
}: RecordingStripProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !signedUrl) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card">
      {signedUrl ? (
        <audio
          ref={audioRef}
          src={signedUrl}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
          }}
          className="sr-only"
        />
      ) : null}
      <button
        type="button"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 bg-surface text-gold"
        aria-label={playing ? "Pause recording" : "Play recording"}
        onClick={toggle}
        disabled={!signedUrl}
      >
        {playing ? (
          <span className="flex gap-0.5" aria-hidden>
            <span className="h-4 w-1 rounded-sm bg-gold" />
            <span className="h-4 w-1 rounded-sm bg-gold" />
          </span>
        ) : (
          <IconPlay size={18} className="text-gold" />
        )}
      </button>
      <div className="relative h-1 min-w-0 flex-1 rounded-full bg-gold/20">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gold"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted">
        {formatDurationSeconds(durationSeconds)}
      </span>
      <span className="hidden shrink-0 text-xs text-muted sm:inline">
        Recorded · {formatTranscriptionDate(new Date(recordedAt))}
      </span>
    </div>
  );
};

export default RecordingStrip;
