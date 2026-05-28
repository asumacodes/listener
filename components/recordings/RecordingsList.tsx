import { formatIsoDate, formatTime } from "@/lib/format";
import type { RecordingWithPlayback } from "@/types/recording";
import Link from "next/link";

type RecordingsListProps = {
  recordings: RecordingWithPlayback[];
  error?: string | null;
};

const RecordingsList = ({ recordings, error }: RecordingsListProps) => {
  if (error) {
    return (
      <main className="mx-auto w-full max-w-[640px] px-6 py-10">
        <p className="text-sm text-recording-red">
          Couldn&apos;t load recordings: {error}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-10">
      <h1 className="font-serif text-3xl text-text-primary">Your recordings</h1>
      <p className="mt-1 text-sm text-text-muted">
        Debug view. Replaced by the project list in Block 4.
      </p>

      {recordings.length === 0 ? (
        <p className="mt-10 text-sm text-text-secondary">
          No recordings yet.{" "}
          <Link href="/" className="underline">
            Record one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {recordings.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-black/10 bg-card-white p-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-xl text-text-primary">
                  {r.title}
                </h2>
                <span className="text-xs text-text-muted">
                  {formatIsoDate(r.created_at)}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {formatTime(r.duration_seconds)}
                {r.language ? ` · ${r.language.toUpperCase()}` : ""}
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
          ))}
        </ul>
      )}
    </main>
  );
};

export default RecordingsList;
