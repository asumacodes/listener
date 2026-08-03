"use client";

import { useCaptureLauncher } from "@/components/desktop/CaptureLauncherContext";
import IdeaCard from "@/components/desktop/IdeaCard";
import {
  IconChevron,
  IconMic,
  IconPlus,
  IconSearch,
} from "@/components/icons/ListenerIcons";
import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import Button from "@/components/ui/Button";
import { projectsQueryKey } from "@/hooks/useProjectsQuery";
import { listDesktopHomeIdeas } from "@/lib/desktop/home";
import type { ProjectColor } from "@/lib/palette";
import { createProject } from "@/lib/projects";
import type { DesktopIdeaCardModel, DesktopProjectTab } from "@/types/desktop";
import type { ProjectFormMode } from "@/types/project";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

type SortMode = "newest" | "oldest";

const CREATE_MODE: ProjectFormMode = { kind: "create", context: "list" };

const LauncherCard = ({ onLaunch }: { onLaunch: () => void }) => (
  <button
    type="button"
    onClick={onLaunch}
    className="flex min-h-[220px] flex-col items-start rounded-2xl border border-gold/30 bg-surface p-[22px] text-left shadow-card transition hover:border-gold/50"
  >
    <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-white shadow-[0_0_0_6px_var(--gold-10)]">
      <IconMic size={16} className="text-white" />
    </span>
    <h3 className="mt-auto font-serif text-[23px] leading-[1.15] text-text">
      Have a new idea?
    </h3>
    <span className="mt-2 text-xs font-medium tracking-[0.04em] text-gold-deep">
      Run the pipeline →
    </span>
  </button>
);

const DesktopHomeGrid = () => {
  const { openCapture } = useCaptureLauncher();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [projectId, setProjectId] = useState<string | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["desktop-home-ideas"],
    queryFn: listDesktopHomeIdeas,
    refetchInterval: (query) => {
      const ideas = query.state.data?.ideas ?? [];
      const anyLive = ideas.some(
        (i) => i.status === "running" || i.status === "queued"
      );
      return anyLive ? 4500 : false;
    },
  });

  const projects: DesktopProjectTab[] = data?.projects ?? [];

  const filtered = useMemo(() => {
    const ideas: DesktopIdeaCardModel[] = data?.ideas ?? [];
    let list = ideas;
    if (projectId !== "all") {
      list = list.filter((i) => i.projectId === projectId);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (a.status === "running" && b.status !== "running") return -1;
      if (b.status === "running" && a.status !== "running") return 1;
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [data?.ideas, projectId, query, sort]);

  const runningIdea = filtered.find((i) => i.status === "running") ?? null;
  const [dismissedRunningId, setDismissedRunningId] = useState<string | null>(
    null
  );
  const showRunningToast =
    Boolean(runningIdea) && dismissedRunningId !== runningIdea?.id;

  const openCreate = () => {
    setFormKey((k) => k + 1);
    setCreateOpen(true);
  };

  const onCreateProject = async (name: string, color: ProjectColor) => {
    const project = await createProject(name, color);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["desktop-home-ideas"] }),
      queryClient.invalidateQueries({ queryKey: projectsQueryKey }),
    ]);
    setProjectId(project.id);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-canvas">
      <header className="flex h-[78px] shrink-0 items-center gap-[18px] border-b border-border px-11">
        <h1 className="font-serif text-[27px] leading-none text-text">
          Projects
        </h1>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2.5">
          <div className="relative w-full max-w-[320px]">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
              <IconSearch size={14} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ideas"
              className="h-[34px] w-full rounded-full border border-border bg-surface pr-3.5 pl-9 text-xs text-text outline-none placeholder:text-muted focus:border-gold focus:shadow-[0_0_0_2px_var(--gold-30)]"
            />
          </div>
          <label className="sr-only" htmlFor="desktop-home-sort">
            Sort
          </label>
          <div className="relative shrink-0">
            <select
              id="desktop-home-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="h-[34px] appearance-none rounded-full border border-border bg-surface py-0 pr-8 pl-3.5 text-xs leading-none text-text-secondary outline-none focus:border-gold focus:shadow-[0_0_0_2px_var(--gold-30)]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <IconChevron
              size={12}
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-text-secondary"
            />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[22px] px-11 pt-[34px]">
        <div className="flex items-center gap-[22px]">
          <div className="flex min-w-0 flex-1 gap-[22px] overflow-x-auto scrollbar-hide">
            {projects.map((p) => {
              const active = projectId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProjectId(p.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-[1.5px] pb-2 text-xs font-medium tracking-[0.06em] uppercase transition ${
                    active
                      ? "border-gold text-text"
                      : "border-transparent text-muted hover:text-text-secondary"
                  }`}
                >
                  {p.name}
                  <span className="font-normal text-muted">
                    · {p.ideaCount} ideas
                  </span>
                </button>
              );
            })}
            {projects.length === 0 && !isLoading ? (
              <span className="pb-2 text-xs tracking-[0.06em] text-muted uppercase">
                No projects yet
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            onClick={openCreate}
            className="!min-h-[34px] shrink-0 rounded-full px-4 text-xs"
          >
            <IconPlus size={12} />
            New project
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-8 scrollbar-hide">
          {error ? (
            <p className="text-sm text-red">
              {error instanceof Error ? error.message : "Failed to load ideas"}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-4 gap-5">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="min-h-[220px] animate-skeleton-shimmer rounded-2xl border border-border bg-border/40"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              <LauncherCard onLaunch={() => openCapture()} />
              {filtered.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  highlight={idea.status === "running"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showRunningToast && runningIdea ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-11">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 text-sm shadow-toast">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            <span className="text-text-secondary">
              Your idea is building — we&apos;ll notify you when it&apos;s
              ready.
            </span>
            <Link
              href={`/ideas/${runningIdea.id}`}
              className="font-medium text-gold hover:brightness-110"
            >
              Watch it build
            </Link>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissedRunningId(runningIdea.id)}
              className="text-muted hover:text-text"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <ProjectFormSheet
        open={createOpen}
        resetKey={`desktop-create-${formKey}`}
        mode={CREATE_MODE}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreateProject}
      />
    </div>
  );
};

export default DesktopHomeGrid;
