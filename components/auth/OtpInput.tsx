"use client";

import { useRef, useState } from "react";

type OtpInputProps = {
  id: string;
  value: string;
  ariaLabel: string;
  disabled?: boolean;
  length?: number;
  onChange: (value: string) => void;
  /** Override digit box sizing (desktop OTP mock). */
  boxClassName?: string;
};

/**
 * Segmented one-time-code input. A single invisible input drives the value
 * (so paste, iOS SMS autofill, and screen readers all work); the boxes are
 * a purely visual layer.
 */
const OtpInput = ({
  id,
  value,
  ariaLabel,
  disabled = false,
  length = 6,
  onChange,
  boxClassName = "",
}: OtpInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const caretIndex = Math.min(value.length, length - 1);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        aria-label={ariaLabel}
        maxLength={length}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, length))
        }
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div className="flex gap-2" aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const digit = value[i] ?? "";
          const active = focused && !disabled && i === caretIndex;
          return (
            <div
              key={i}
              className={`flex h-13 min-w-0 flex-1 items-center justify-center rounded-xl border bg-surface font-sans text-lg font-medium tabular-nums text-text transition ${
                active
                  ? "border-gold shadow-[0_0_0_2px_var(--gold-30)]"
                  : "border-border"
              } ${disabled ? "opacity-50" : ""} ${boxClassName}`}
            >
              {digit ||
                (active && value.length < length ? (
                  <span className="h-5 w-px animate-pulse bg-gold" />
                ) : null)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OtpInput;
