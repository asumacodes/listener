"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 8;
const BAR_HEIGHT = 32;
const MIN_SCALE = 0.2;
/** Voice-heavy bins only (skip DC); at fftSize 256, bins 1–28 ≈ ~90 Hz–2.6 kHz. */
const VOICE_BIN_START = 1;
const VOICE_BIN_COUNT = 28;
const SMOOTH_ATTACK = 0.14;
const SMOOTH_RELEASE = 0.06;

const scaleFromLevel = (level: number, reducedMotion: boolean): number => {
  if (reducedMotion) return 0.35;
  const gained = Math.min(1, level * 1.35);
  const curved = Math.pow(gained, 0.72);
  return MIN_SCALE + curved * (1 - MIN_SCALE);
};

const smoothScale = (current: number, target: number): number => {
  const rate = target > current ? SMOOTH_ATTACK : SMOOTH_RELEASE;
  return current + (target - current) * rate;
};

const WaveformVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const scalesRef = useRef<number[]>(Array(BAR_COUNT).fill(MIN_SCALE));
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -22;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const bandSize = Math.max(1, Math.floor(VOICE_BIN_COUNT / BAR_COUNT));

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(data);

      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        const start = VOICE_BIN_START + i * bandSize;
        const end = Math.min(
          VOICE_BIN_START + VOICE_BIN_COUNT,
          start + bandSize
        );

        let peak = 0;
        for (let b = start; b < end; b++) {
          if (data[b] > peak) peak = data[b];
        }

        const target = scaleFromLevel(peak / 255, reducedMotion);
        const smoothed = smoothScale(scalesRef.current[i] ?? MIN_SCALE, target);
        scalesRef.current[i] = smoothed;
        bar.style.transform = `scaleY(${smoothed})`;
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

      scalesRef.current = Array(BAR_COUNT).fill(MIN_SCALE);
      bars.forEach((bar) => {
        if (bar) bar.style.transform = `scaleY(${MIN_SCALE})`;
      });
    };
  }, [stream]);

  return (
    <div
      className="flex h-8 items-end justify-center gap-1.5"
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(el) => {
            barsRef.current[index] = el;
          }}
          className="block w-1.5 origin-bottom rounded-full bg-gold will-change-transform"
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
