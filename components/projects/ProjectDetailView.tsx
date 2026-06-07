"use client";

import IdeaCard from "@/components/cards/IdeaCard";
import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import { IconBack } from "@/components/icons/ListenerIcons";
import { ideaStatusFromRun } from "@/lib/projects/rollup";
import { colorHex, isProjectColor } from "@/lib/palette";
import type { ProjectDetailViewProps } from "@/types/project";
import Link from "next/link";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const ProjectDetailView = ({ project, recordings }: ProjectDetailViewProps) => {
  const dotColor = isProjectColor(project.color)
    ? colorHex(project.color)
    : "#C9B88F";

  return (
    <>
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
        sub={`${recordings.length} idea${recordings.length === 1 ? "" : "s"}`}
      />

      <ScrollBody>
        {recordings.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-secondary">
            No recordings in this project yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {recordings.map((r) => (
              <li key={r.id}>
                <IdeaCard
                  href={`/ideas/${r.id}`}
                  title={r.title}
                  summary={r.transcription}
                  time={formatDate(r.created_at)}
                  status={ideaStatusFromRun(r.latestRunStatus)}
                />
              </li>
            ))}
          </ul>
        )}
      </ScrollBody>
    </>
  );
};

export default ProjectDetailView;
