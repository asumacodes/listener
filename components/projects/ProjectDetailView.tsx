import { formatIsoDate, formatTime } from "@/lib/format";
import { languageLabel } from "@/lib/language";
import { colorHex, isProjectColor } from "@/lib/palette";
import type { ProjectDetailViewProps } from "@/types/project";
import Link from "next/link";

const ProjectDetailView = ({ project, recordings }: ProjectDetailViewProps) => {
  const dotColor = isProjectColor(project.color)
    ? colorHex(project.color)
    : "#C9B88F";

  return (
    <div className="mt-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-text"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Projects
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden
        />
        <h1 className="font-serif text-3xl text-text">{project.name}</h1>
      </div>

      {recordings.length === 0 ? (
        <p className="mt-10 text-sm text-text-secondary">
          No recordings in this project yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {recordings.map((r) => {
            const languageDisplay = languageLabel(r.language);
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-xl text-text">{r.title}</h2>
                  <span className="text-xs text-muted">
                    {formatIsoDate(r.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatTime(r.duration_seconds)}
                  {languageDisplay ? ` · ${languageDisplay}` : ""}
                </p>
                {r.signedUrl && (
                  <audio
                    controls
                    className="mt-3 w-full"
                    src={r.signedUrl}
                    preload="metadata"
                  />
                )}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {r.transcription}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProjectDetailView;
