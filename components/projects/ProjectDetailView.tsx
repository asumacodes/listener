"use client";

import IdeaCard from "@/components/cards/IdeaCard";
import DeleteProjectSheet from "@/components/confirm/DeleteProjectSheet";
import AppShellHeader, { MoreButton } from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import {
  IconBack,
  IconMic,
  IconSearch,
} from "@/components/icons/ListenerIcons";
import Input from "@/components/ui/Input";
import RecordFab from "@/components/ui/RecordFab";
import useProjectDetailEdit from "@/hooks/useProjectDetailEdit";
import { copy } from "@/lib/design/copy";
import { formatIdeasCount } from "@/lib/format";
import { formatIdeaTime } from "@/lib/format-date";
import { filterRecordingsByQuery } from "@/lib/projects/filter-recordings";
import { ui } from "@/lib/design/ui";
import { colorHex, isProjectColor } from "@/lib/palette";
import type { ProjectDetailViewProps } from "@/types/project";
import Link from "next/link";
import { useMemo, useState } from "react";

const projectSubline = (count: number) =>
  count === 0 ? copy.projectDetail.noIdeasYet : formatIdeasCount(count);

const ProjectDetailView = ({ project, recordings }: ProjectDetailViewProps) => {
  const edit = useProjectDetailEdit(project, recordings.length);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterRecordingsByQuery(recordings, query),
    [recordings, query]
  );

  const isFiltering = query.trim().length > 0;
  const noMatches = isFiltering && filtered.length === 0;

  const dotColor = isProjectColor(project.color)
    ? colorHex(project.color)
    : "#C9B88F";
  const isEmpty = recordings.length === 0;

  const subline = isFiltering
    ? `${filtered.length} of ${formatIdeasCount(recordings.length)}`
    : projectSubline(recordings.length);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <AppShellHeader
          left={
            <Link
              href="/projects"
              aria-label="Back to projects"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary transition hover:text-text"
            >
              <IconBack size={22} />
            </Link>
          }
          title={project.name}
          dotColor={dotColor}
          sub={subline}
          right={
            project.is_default ? undefined : (
              <MoreButton onClick={edit.onOpenEdit} />
            )
          }
        />

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center">
            <div className={`${ui.emptyMark} mb-[18px]`} aria-hidden>
              <IconMic size={28} />
            </div>
            <h2 className="font-serif text-2xl text-text">
              {copy.projectDetail.emptyTitle}
            </h2>
            <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-muted">
              {copy.projectDetail.emptyLead}
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
            <ScrollBody className="pb-24">
              <div className="relative mb-4">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
                  <IconSearch size={20} />
                </span>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy.projectDetail.searchPlaceholder}
                  className="rounded-xl pl-11"
                  aria-label="Search in this project"
                />
              </div>

              {noMatches ? (
                <p className="px-1 py-6 text-sm text-muted">
                  {copy.projectDetail.noMatches}
                </p>
              ) : (
                <ul className="space-y-3">
                  {filtered.map((r) => (
                    <li key={r.id}>
                      <IdeaCard
                        href={`/ideas/${r.id}`}
                        title={r.title}
                        summary={r.transcription}
                        time={formatIdeaTime(r.created_at)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </ScrollBody>
            <RecordFab />
          </div>
        )}
      </div>

      <ProjectFormSheet
        open={edit.formOpen}
        resetKey={edit.formResetKey}
        mode={edit.formMode}
        onClose={edit.onCloseForm}
        onSubmit={edit.onSubmitForm}
        onDelete={edit.onRequestDeleteFromEdit}
      />

      <DeleteProjectSheet
        open={edit.deleteOpen}
        ideaCount={edit.recordingCount}
        busy={edit.isDeleting}
        onClose={edit.onCancelDelete}
        onConfirm={edit.onConfirmDelete}
      />
    </>
  );
};

export default ProjectDetailView;
