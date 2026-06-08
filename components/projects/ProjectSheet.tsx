"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { IconPlus, IconSearch } from "@/components/icons/ListenerIcons";
import { formatIdeasCount } from "@/lib/format";
import { PROJECT_COLORS, colorHex, type ProjectColor } from "@/lib/palette";
import { ui } from "@/lib/design/ui";
import type { ProjectWithCount } from "@/lib/projects";
import { useMemo, useState } from "react";

type ProjectSheetPanelProps = {
  onClose: () => void;
  projects: ProjectWithCount[];
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  initialCreate: boolean;
  suggestedName?: string | null;
};

const ProjectSheetPanel = ({
  onClose,
  projects,
  onSelect,
  onCreateAndAssign,
  initialCreate,
  suggestedName,
}: ProjectSheetPanelProps) => {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(initialCreate);
  const [newName, setNewName] = useState("");
  const [color, setColor] = useState<ProjectColor>("sand");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

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
    <>
      <div className="psheet-scrim absolute inset-0 bg-black/40" />
      <div
        className={`psheet relative z-10 max-h-[85dvh] w-full animate-sheet-up overflow-hidden ${ui.sheet} pb-[max(1rem,env(safe-area-inset-bottom))]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="project-sheet-title"
      >
        <div className="psheet-handle mx-auto mt-3 h-1 w-10 rounded-full bg-border" />
        <h2
          id="project-sheet-title"
          className="psheet-title px-5 pt-4 font-serif text-2xl text-text"
        >
          Add to a project
        </h2>

        <div className="psheet-search mx-5 mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 shadow-card">
          <IconSearch size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="min-h-11 flex-1 bg-transparent text-[15px] text-text outline-none"
          />
        </div>

        <div className="psheet-list mt-3 max-h-[min(52dvh,28rem)] overflow-y-auto scrollbar-hide px-5 pb-5">
          {suggestedName ? (
            <button
              type="button"
              className="psheet-row suggested flex w-full items-center gap-3 rounded-xl border border-gold-30 bg-gold-10 px-3 py-3 text-left"
              onClick={() => void onCreateAndAssign(suggestedName, "sand")}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full"
                style={{ backgroundColor: colorHex("sand") }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-text">
                  {suggestedName}
                </span>
                <span className="text-xs text-text-secondary">
                  New project · suggested
                </span>
              </span>
              <span className="text-[11px] font-medium tracking-wide text-gold uppercase">
                Suggested
              </span>
            </button>
          ) : null}

          <p className={`${ui.eyebrow} mt-4 mb-2`}>Your projects</p>

          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="psheet-row flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-black/[0.03]"
              onClick={() => onSelect(p.id)}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full border border-black/[0.06]"
                style={{ backgroundColor: colorHex(p.color) }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 font-medium text-text">
                {p.name}
              </span>
              <span className="shrink-0 text-xs text-muted">
                {formatIdeasCount(p.recording_count)}
              </span>
            </button>
          ))}

          {!creating ? (
            <button
              type="button"
              className="psheet-create-row mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-dashed-add bg-transparent px-4 py-3.5 text-sm font-medium text-gold transition hover:border-gold-30 hover:bg-gold-10"
              onClick={() => setCreating(true)}
            >
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-gold-10 text-gold">
                <IconPlus size={14} />
              </span>
              Create new project
            </button>
          ) : (
            <div className="psheet-create mt-3 space-y-3 rounded-xl border border-border bg-canvas p-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name"
                autoFocus
              />
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
              <Button
                fullWidth
                disabled={busy || !newName.trim()}
                onClick={() => void handleCreate()}
              >
                Create &amp; add
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

type ProjectSheetProps = {
  open: boolean;
  onClose: () => void;
  projects: ProjectWithCount[];
  onSelect: (projectId: string) => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
  initialCreate?: boolean;
  onOpenCreate?: () => void;
  suggestedName?: string | null;
};

const ProjectSheet = ({
  open,
  onClose,
  projects,
  onSelect,
  onCreateAndAssign,
  initialCreate = false,
  suggestedName,
}: ProjectSheetProps) => {
  if (!open) return null;

  return (
    <div
      className="psheet-stage fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
      role="presentation"
    >
      <ProjectSheetPanel
        key={initialCreate ? "create" : "browse"}
        onClose={onClose}
        projects={projects}
        onSelect={onSelect}
        onCreateAndAssign={onCreateAndAssign}
        initialCreate={initialCreate}
        suggestedName={suggestedName}
      />
    </div>
  );
};

export default ProjectSheet;
