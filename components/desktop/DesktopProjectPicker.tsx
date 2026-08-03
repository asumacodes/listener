"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  IconChevron,
  IconPlus,
  IconSearch,
} from "@/components/icons/ListenerIcons";
import { formatIdeasCount } from "@/lib/format";
import { PROJECT_COLORS, colorHex, type ProjectColor } from "@/lib/palette";
import type { ProjectWithCount } from "@/lib/projects";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type DesktopProjectPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  dotColor: string;
  projects: ProjectWithCount[];
  selectedId: string | null;
  isSaving?: boolean;
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  startInCreate?: boolean;
};

type PanelProps = {
  listId: string;
  projects: ProjectWithCount[];
  selectedId: string | null;
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  onClose: () => void;
  startInCreate: boolean;
};

const DesktopProjectPickerPanel = ({
  listId,
  projects,
  selectedId,
  onSelect,
  onCreateAndAssign,
  onClose,
  startInCreate,
}: PanelProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(startInCreate);
  const [newName, setNewName] = useState("");
  const [color, setColor] = useState<ProjectColor>("sand");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  useEffect(() => {
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      await onCreateAndAssign(name, color);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Projects"
      className="absolute top-[calc(100%+8px)] left-0 z-40 w-[320px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_40px_rgba(26,26,26,0.12)]"
    >
      <div className="border-b border-border p-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3">
          <IconSearch size={14} className="shrink-0 text-muted" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="min-h-9 flex-1 bg-transparent text-[13px] text-text outline-none"
          />
        </div>
      </div>

      <div className="max-h-[280px] overflow-y-auto py-1.5 scrollbar-hide">
        <p className="px-3.5 pt-1.5 pb-1 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
          Your projects
        </p>
        {filtered.length === 0 ? (
          <p className="px-3.5 py-6 text-center text-[13px] text-muted">
            No matches
          </p>
        ) : (
          filtered.map((p) => {
            const selected = p.id === selectedId;
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onSelect(p.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-canvas ${
                  selected ? "bg-gold-10" : ""
                }`}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-black/[0.06]"
                  style={{ backgroundColor: colorHex(p.color) }}
                  aria-hidden
                />
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] font-medium ${
                    selected ? "text-gold-deep" : "text-text"
                  }`}
                >
                  {p.name}
                </span>
                <span className="shrink-0 text-[11px] text-muted">
                  {formatIdeasCount(p.recording_count)}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-2.5">
        {!creating ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dashed-border px-3 py-2.5 text-[13px] font-medium text-gold transition hover:border-gold/40 hover:bg-gold-10"
          >
            <IconPlus size={14} />
            Create new project
          </button>
        ) : (
          <div className="space-y-2.5 rounded-xl border border-border bg-canvas p-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              autoFocus
              className="!min-h-9 !py-2 !text-[13px]"
            />
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-label={c.label}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    color === c.key ? "border-gold" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c.key)}
                />
              ))}
            </div>
            <Button
              fullWidth
              disabled={busy || !newName.trim()}
              onClick={() => void handleCreate()}
              className="!min-h-9 !rounded-xl !text-xs"
            >
              Create &amp; add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Desktop project assign — chip + anchored popover (not a mobile bottom sheet).
 */
const DesktopProjectPicker = ({
  open,
  onOpenChange,
  label,
  projects,
  selectedId,
  isSaving = false,
  onSelect,
  onCreateAndAssign,
  startInCreate = false,
}: DesktopProjectPickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        disabled={isSaving}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Project: ${label}. Change project`}
        className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-text-secondary transition hover:border-gold/40 hover:text-text disabled:opacity-60"
      >
        <span className="min-w-0 truncate">{label}</span>
        <IconChevron
          size={12}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <DesktopProjectPickerPanel
          listId={listId}
          projects={projects}
          selectedId={selectedId}
          onSelect={onSelect}
          onCreateAndAssign={onCreateAndAssign}
          onClose={() => onOpenChange(false)}
          startInCreate={startInCreate}
        />
      ) : null}
    </div>
  );
};

export default DesktopProjectPicker;
