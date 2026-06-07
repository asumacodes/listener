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
    <div className="rec-strip">
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
        className="rec-strip-play"
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
      <div className="rec-strip-scrub" aria-hidden>
        <div className="rec-strip-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="rec-strip-dur">
        {formatDurationSeconds(durationSeconds)}
      </span>
      <span className="rec-strip-cap">
        Recorded · {formatTranscriptionDate(new Date(recordedAt))}
      </span>
    </div>
  );
};

export default RecordingStrip;
