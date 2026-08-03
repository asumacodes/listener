"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { IconPlus, IconSearch } from "@/components/icons/ListenerIcons";
import { formatIdeasCount } from "@/lib/format";
import { ui } from "@/lib/design/ui";
import { PROJECT_COLORS, colorHex, type ProjectColor } from "@/lib/palette";
import type { ProjectWithCount } from "@/lib/projects";
import { useEffect, useMemo, useRef, useState } from "react";

export type ProjectPickerBodyProps = {
  projects: ProjectWithCount[];
  selectedId: string | null;
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  onClose: () => void;
  startInCreate?: boolean;
  suggestedName?: string | null;
  /** `popover` — desktop anchored menu. `sheet` — mobile bottom sheet content. */
  density?: "popover" | "sheet";
  listId?: string;
  autoFocusSearch?: boolean;
};

/**
 * Shared project list + search + create form.
 * Shells (DesktopProjectPicker popover, ProjectSheet) supply chrome only.
 */
const ProjectPickerBody = ({
  projects,
  selectedId,
  onSelect,
  onCreateAndAssign,
  onClose,
  startInCreate = false,
  suggestedName,
  density = "popover",
  listId,
  autoFocusSearch = true,
}: ProjectPickerBodyProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(startInCreate);
  const [newName, setNewName] = useState("");
  const [color, setColor] = useState<ProjectColor>("sand");
  const [busy, setBusy] = useState(false);
  const isSheet = density === "sheet";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  useEffect(() => {
    if (!autoFocusSearch) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [autoFocusSearch]);

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

  const projectRows = (
    <>
      {suggestedName && isSheet ? (
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-gold-30 bg-gold-10 px-3 py-3 text-left"
          onClick={() => void onCreateAndAssign(suggestedName, "sand")}
        >
          <span
            className="h-6 w-6 shrink-0 rounded-full"
            style={{ backgroundColor: colorHex("sand") }}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-text">{suggestedName}</span>
            <span className="text-xs text-text-secondary">
              New project · suggested
            </span>
          </span>
          <span className="text-[11px] font-medium tracking-wide text-gold uppercase">
            Suggested
          </span>
        </button>
      ) : null}

      <p
        className={
          isSheet
            ? `${ui.eyebrow} mt-4 mb-2`
            : "px-3.5 pt-1.5 pb-1 text-[10px] font-medium tracking-[0.14em] text-muted uppercase"
        }
      >
        Your projects
      </p>

      {filtered.length === 0 ? (
        <p
          className={
            isSheet
              ? "py-6 text-center text-sm text-muted"
              : "px-3.5 py-6 text-center text-[13px] text-muted"
          }
        >
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
              className={`flex w-full items-center text-left transition ${
                isSheet
                  ? "gap-3 rounded-xl px-3 py-3 hover:bg-black/[0.03]"
                  : `gap-2.5 px-3.5 py-2.5 hover:bg-canvas ${selected ? "bg-gold-10" : ""}`
              }`}
            >
              <span
                className={`shrink-0 rounded-full border border-black/[0.06] ${
                  isSheet ? "h-6 w-6" : "h-5 w-5"
                }`}
                style={{ backgroundColor: colorHex(p.color) }}
                aria-hidden
              />
              <span
                className={`min-w-0 flex-1 truncate font-medium ${
                  isSheet ? "text-text" : "text-[13px]"
                } ${selected && !isSheet ? "text-gold-deep" : "text-text"}`}
              >
                {p.name}
              </span>
              <span
                className={`shrink-0 text-muted ${
                  isSheet ? "text-xs" : "text-[11px]"
                }`}
              >
                {formatIdeasCount(p.recording_count)}
              </span>
            </button>
          );
        })
      )}
    </>
  );

  const createBlock = !creating ? (
    <button
      type="button"
      onClick={() => setCreating(true)}
      className={
        isSheet
          ? "mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-dashed-add bg-transparent px-4 py-3.5 text-sm font-medium text-gold transition hover:border-gold-30 hover:bg-gold-10"
          : "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dashed-border px-3 py-2.5 text-[13px] font-medium text-gold transition hover:border-gold/40 hover:bg-gold-10"
      }
    >
      {isSheet ? (
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-gold-10 text-gold">
          <IconPlus size={14} />
        </span>
      ) : (
        <IconPlus size={14} />
      )}
      Create new project
    </button>
  ) : (
    <div
      className={
        isSheet
          ? "mt-3 space-y-3 rounded-xl border border-border bg-canvas p-4"
          : "space-y-2.5 rounded-xl border border-border bg-canvas p-3"
      }
    >
      <Input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Project name"
        autoFocus
        className={isSheet ? undefined : "!min-h-9 !py-2 !text-[13px]"}
      />
      {isSheet ? (
        <div>
          <p className={`${ui.eyebrow} mb-2`}>Colour</p>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-label={c.label}
                className={`h-8 w-8 rounded-full border-2 transition ${
                  color === c.key ? "border-gold" : "border-transparent"
                }`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.key)}
              />
            ))}
          </div>
        </div>
      ) : (
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
      )}
      <Button
        fullWidth
        disabled={busy || !newName.trim()}
        onClick={() => void handleCreate()}
        className={isSheet ? undefined : "!min-h-9 !rounded-xl !text-xs"}
      >
        Create &amp; add
      </Button>
    </div>
  );

  const searchField = (
    <div
      className={
        isSheet
          ? "flex items-center gap-2 rounded-xl border border-border bg-surface px-3 shadow-card"
          : "flex items-center gap-2 rounded-xl border border-border bg-canvas px-3"
      }
    >
      <IconSearch size={isSheet ? 16 : 14} className="shrink-0 text-muted" />
      <input
        ref={searchRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects…"
        className={
          isSheet
            ? "min-h-11 flex-1 bg-transparent text-[15px] text-text outline-none"
            : "min-h-9 flex-1 bg-transparent text-[13px] text-text outline-none"
        }
      />
    </div>
  );

  if (isSheet) {
    return (
      <>
        <div className="mx-5 mt-4">{searchField}</div>
        <div className="mt-3 max-h-[min(52dvh,28rem)] overflow-y-auto scrollbar-hide px-5 pb-5">
          {projectRows}
          {createBlock}
        </div>
      </>
    );
  }

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Projects"
      className="absolute top-[calc(100%+8px)] left-0 z-[60] w-[320px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_40px_rgba(26,26,26,0.12)]"
    >
      <div className="border-b border-border p-2.5">{searchField}</div>
      <div className="max-h-[280px] overflow-y-auto py-1.5 scrollbar-hide">
        {projectRows}
      </div>
      <div className="border-t border-border p-2.5">{createBlock}</div>
    </div>
  );
};

export default ProjectPickerBody;
