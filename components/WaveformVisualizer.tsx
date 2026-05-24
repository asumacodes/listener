"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 7;
const BAR_HEIGHT = 32;
const MIN_SCALE = 0.125;

const WaveformVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(data);

      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        const index = Math.floor((i / BAR_COUNT) * data.length);
        const value = data[index] / 255;
        const scale = reducedMotion
          ? 0.35
          : MIN_SCALE + value * (1 - MIN_SCALE);

        bar.style.transform = `scaleY(${scale})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const bars = barsRef.current;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
      analyserRef.current = null;

      bars.forEach((bar) => {
        if (bar) bar.style.transform = `scaleY(${MIN_SCALE})`;
      });
    };
  }, [stream]);

  return (
    <div
      ref={containerRef}
      className="flex h-8 items-end justify-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(el) => {
            barsRef.current[index] = el;
          }}
          className="block w-1.5 origin-bottom rounded-full bg-gold-primary will-change-transform"
          style={{
            height: `${BAR_HEIGHT}px`,
            transform: `scaleY(${MIN_SCALE})`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
