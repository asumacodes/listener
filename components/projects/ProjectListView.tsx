"use client";

import ProjectCard from "@/components/cards/ProjectCard";
import DeleteProjectSheet from "@/components/confirm/DeleteProjectSheet";
import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import SkeletonProjectList from "@/components/ui/skeleton/SkeletonProjectList";
import { IconGrid, IconPlus } from "@/components/icons/ListenerIcons";
import { formatIdeasCount } from "@/lib/format";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { colorHex } from "@/lib/palette";
import type { ProjectWithRollup } from "@/lib/projects/rollup";
import type { ProjectListViewProps } from "@/types/project";
import Link from "next/link";

const isProjectsEmpty = (projects: ProjectWithRollup[]) =>
  projects.length === 0 ||
  (projects.length === 1 &&
    projects[0].is_default &&
    projects[0].recording_count === 0);

const projectLine = (p: ProjectWithRollup) => {
  const parts = [formatIdeasCount(p.recording_count)];
  if (p.rollup.runningCount > 0) {
    parts.push(`${p.rollup.runningCount} running`);
  }
  return parts.join(" · ");
};

const ProjectListView = ({
  projects,
  loading,
  error,
  formOpen,
  formMode,
  formResetKey,
  deleteTarget,
  isDeleting,
  onOpenCreate,
  onCloseForm,
  onSubmitForm,
  onRequestDeleteFromEdit,
  onCancelDelete,
  onConfirmDelete,
}: ProjectListViewProps) => {
  const showEmpty = !loading && isProjectsEmpty(projects);

  if (loading) {
    return <SkeletonProjectList />;
  }

  return (
    <>
      {showEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
          <div className={`${ui.emptyMark} mb-[18px]`} aria-hidden>
            <IconGrid size={30} />
          </div>
          <h2 className="font-serif text-2xl text-text">
            {copy.projects.emptyTitle}
          </h2>
          <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-muted">
            {copy.projects.emptyLead}
            <br />
            {copy.projects.emptyHint}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 min-w-[168px] items-center justify-center rounded-xl border border-transparent bg-gold px-[22px] font-sans text-[15px] font-medium text-white transition hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-30 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            {copy.projects.recordCta}
          </Link>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-hide pb-24 pt-2">
            {error ? <p className="text-xs text-red">{error}</p> : null}

            <ul className="space-y-3">
              {projects.map((p) => {
                const badge =
                  p.rollup.runningCount > 0 ? ("running" as const) : null;
                return (
                  <li key={p.id}>
                    <ProjectCard
                      href={`/projects/${p.id}`}
                      name={p.name}
                      line={projectLine(p)}
                      dotColor={colorHex(p.color)}
                      badge={badge}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="button"
            onClick={onOpenCreate}
            aria-label={copy.projects.newProject}
            className="absolute right-0 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-record transition hover:brightness-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <IconPlus size={24} />
          </button>
        </div>
      )}

      <ProjectFormSheet
        open={formOpen}
        resetKey={formResetKey}
        mode={formMode}
        onClose={onCloseForm}
        onSubmit={onSubmitForm}
        onDelete={formOpen ? onRequestDeleteFromEdit : undefined}
      />

      <DeleteProjectSheet
        open={deleteTarget !== null}
        ideaCount={deleteTarget?.recordingCount ?? 0}
        busy={isDeleting}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default ProjectListView;
