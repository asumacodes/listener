"use client";

import IdeaCard from "@/components/cards/IdeaCard";
import DeleteProjectSheet from "@/components/confirm/DeleteProjectSheet";
import AppShellHeader, { MoreButton } from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import ProjectFormSheet from "@/components/projects/ProjectFormSheet";
import { IconBack, IconMic } from "@/components/icons/ListenerIcons";
import RecordFab from "@/components/ui/RecordFab";
import useProjectDetailEdit from "@/hooks/useProjectDetailEdit";
import { formatIdeasCount } from "@/lib/format";
import { copy } from "@/lib/design/copy";
import { formatIdeaTime } from "@/lib/format-date";
import { ui } from "@/lib/design/ui";
import { colorHex, isProjectColor } from "@/lib/palette";
import type { ProjectDetailViewProps } from "@/types/project";
import Link from "next/link";

const projectSubline = (count: number) =>
  count === 0 ? copy.projectDetail.noIdeasYet : formatIdeasCount(count);

const ProjectDetailView = ({ project, recordings }: ProjectDetailViewProps) => {
  const edit = useProjectDetailEdit(project, recordings.length);
  const dotColor = isProjectColor(project.color)
    ? colorHex(project.color)
    : "#C9B88F";
  const isEmpty = recordings.length === 0;

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
          sub={projectSubline(recordings.length)}
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
              <ul className="space-y-3">
                {recordings.map((r) => (
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
