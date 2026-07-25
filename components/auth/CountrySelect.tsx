"use client";

import * as Flags from "country-flag-icons/react/3x2";
import { COUNTRIES, filterCountries, getCountry } from "@/lib/auth/countries";
import { useEffect, useMemo, useRef, useState } from "react";

type CountrySelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  ariaLabel: string;
};

type FlagComponent = (props: {
  title?: string;
  className?: string;
}) => React.ReactElement;

const Flag = ({ code, className }: { code: string; className?: string }) => {
  const Component = (Flags as Record<string, FlagComponent | undefined>)[code];
  if (!Component) {
    return (
      <span className={`text-[11px] font-medium text-muted ${className ?? ""}`}>
        {code}
      </span>
    );
  }
  return <Component title={code} className={className} />;
};

const CountrySelect = ({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = getCountry(value) ?? COUNTRIES[0];
  const results = useMemo(() => filterCountries(query), [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus search when the popover mounts — DOM only, no React state.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openPopover = () => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const closePopover = () => setOpen(false);

  const togglePopover = () => {
    if (open) closePopover();
    else openPopover();
  };

  const commit = (code: string) => {
    onChange(code);
    closePopover();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[activeIndex];
      if (pick) commit(pick.code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePopover();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={togglePopover}
        className="flex h-13 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 font-sans text-[15px] text-text outline-none transition hover:bg-black/3 focus-visible:border-gold focus-visible:shadow-[0_0_0_2px_var(--gold-30)] disabled:opacity-50"
      >
        <Flag code={selected.code} className="h-4 w-6 rounded-xs" />
        <span className="tabular-nums">+{selected.dial}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-border bg-white shadow-[0_12px_40px_rgba(26,26,26,0.16)]"
          onKeyDown={onKeyDown}
        >
          <div className="border-b border-border p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-sans text-sm text-text outline-none focus:border-gold"
              aria-label="Search countries"
              aria-controls="country-listbox"
            />
          </div>
          <ul
            ref={listRef}
            id="country-listbox"
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-64 overflow-y-auto py-1"
          >
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                No matches
              </li>
            ) : (
              results.map((c, i) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === value}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => commit(c.code)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left font-sans text-sm transition ${
                      i === activeIndex ? "bg-gold-10" : ""
                    } ${c.code === value ? "text-gold" : "text-text"}`}
                  >
                    <Flag code={c.code} className="h-4 w-6 rounded-xs" />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="tabular-nums text-muted">+{c.dial}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default CountrySelect;
