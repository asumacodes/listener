"use client";

import AudioPlayer from "@/components/AudioPlayer";
import DesktopProjectPicker from "@/components/desktop/DesktopProjectPicker";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import Button from "@/components/ui/Button";
import { IconMic, IconMicOff } from "@/components/icons/ListenerIcons";
import type { CaptureProjectPicker } from "@/hooks/useCaptureProject";
import { countWords, formatTime } from "@/lib/format";
import Link from "next/link";

export type CaptureProjectControls = Pick<
  CaptureProjectPicker,
  "projects" | "selectedId" | "label" | "onSelect" | "onCreateAndSelect"
>;

export const CaptureProjectField = ({
  project,
  open,
  onOpenChange,
}: {
  project: CaptureProjectControls;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <DesktopProjectPicker
    variant="field"
    open={open}
    onOpenChange={onOpenChange}
    label={project.label}
    projects={project.projects}
    selectedId={project.selectedId}
    onSelect={project.onSelect}
    onCreateAndAssign={async (name, color) => {
      await project.onCreateAndSelect(name, color);
    }}
  />
);

export const CaptureIdleState = ({
  project,
  projectPickerOpen,
  onProjectPickerOpenChange,
  onRecord,
  onType,
}: {
  project: CaptureProjectControls;
  projectPickerOpen: boolean;
  onProjectPickerOpenChange: (open: boolean) => void;
  onRecord: () => void;
  onType: () => void;
}) => (
  <div className="flex flex-col items-center text-center">
    <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
      New idea
    </p>
    <h2
      id="capture-modal-title"
      className="mt-3 font-serif text-[28px] leading-tight tracking-[-0.01em] text-text"
    >
      Speak. Transcribe. Build.
    </h2>
    <button
      type="button"
      onClick={onRecord}
      aria-label="Start recording"
      className="relative mt-10 grid h-[120px] w-[120px] place-items-center rounded-full bg-gold text-white shadow-record animate-idle-breathe"
    >
      <span className="pointer-events-none absolute inset-[-10px] rounded-full border border-gold/30" />
      <IconMic size={34} className="text-white" />
    </button>
    <p className="mt-5 text-[12px] font-medium tracking-[0.16em] text-text uppercase">
      Tap to record
    </p>
    <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-text-secondary">
      Say the idea out loud — 15 seconds is plenty. Eight artifacts come back
      while you keep working.
    </p>
    <div className="mt-8 h-px w-full bg-border" />
    <div className="mt-[18px] flex w-full items-center justify-between gap-3 pt-1">
      <CaptureProjectField
        project={project}
        open={projectPickerOpen}
        onOpenChange={onProjectPickerOpenChange}
      />
      <button
        type="button"
        onClick={onType}
        className="text-[13px] font-medium text-gold-deep hover:brightness-110"
      >
        Or type it instead
      </button>
    </div>
  </div>
);

export const CaptureRecordingState = ({
  elapsedSeconds,
  maxSeconds,
  stream,
  onStop,
}: {
  elapsedSeconds: number;
  maxSeconds: number;
  stream: MediaStream | null;
  onStop: () => void;
}) => {
  const nearCap = elapsedSeconds >= maxSeconds - 30;
  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-red/20 bg-error-surface px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-red uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-red" />
        Recording
      </span>
      <p className="mt-8 font-serif text-5xl tracking-tight text-text">
        {formatTime(elapsedSeconds)}
      </p>
      {nearCap ? (
        <p className="mt-2 text-xs text-muted">{formatTime(maxSeconds)} max</p>
      ) : null}
      <div className="mt-6">
        <WaveformVisualizer stream={stream} />
      </div>
      <button
        type="button"
        onClick={onStop}
        aria-label="Stop recording"
        className="mt-10 grid h-[96px] w-[96px] place-items-center rounded-full bg-gold text-white shadow-record"
      >
        <span className="block h-7 w-7 rounded-[8px] bg-white" />
      </button>
      <p className="mt-5 text-[12px] font-medium tracking-[0.16em] text-text uppercase">
        Tap to stop
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        Take as long as you need — 15s is plenty.
      </p>
    </div>
  );
};

export const CaptureReviewState = ({
  audioUrl,
  durationSeconds,
  error,
  onConfirm,
  onReRecord,
}: {
  audioUrl: string | null;
  durationSeconds: number;
  error: string | null;
  onConfirm: () => void;
  onReRecord: () => void;
}) => (
  <div className="flex flex-col text-center">
    <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
      Your take
    </p>
    <h2 className="mt-3 font-serif text-[26px] leading-tight text-text">
      Have a listen before we run it
    </h2>
    <div className="mt-8 w-full rounded-2xl border border-border bg-canvas px-4 py-3">
      {audioUrl ? (
        <AudioPlayer audioUrl={audioUrl} durationSeconds={durationSeconds} />
      ) : null}
    </div>
    {error ? (
      <p className="mt-3 text-center text-xs text-red">{error}</p>
    ) : null}
    <div className="mt-8 flex flex-col gap-3">
      <Button fullWidth onClick={onConfirm}>
        Confirm and continue
      </Button>
      <Button variant="outline" fullWidth onClick={onReRecord}>
        Re-record
      </Button>
    </div>
    <p className="mt-4 text-xs text-muted">
      Nothing is sent until you confirm.
    </p>
  </div>
);

export const CaptureTranscriptState = ({
  text,
  durationSeconds,
  busy,
  error,
  editDisabled,
  onRun,
  onEdit,
  onReRecord,
}: {
  text: string;
  durationSeconds?: number;
  busy?: boolean;
  error?: string | null;
  editDisabled?: boolean;
  onRun: () => void;
  onEdit: () => void;
  onReRecord: () => void;
}) => {
  const words = countWords(text);
  const meta =
    durationSeconds != null && durationSeconds > 0
      ? `${words} words · ${durationSeconds}s`
      : `${words} words`;

  return (
    <div className="flex flex-col">
      <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
        Transcript
      </p>
      <h2 className="mt-3 font-serif text-[26px] leading-tight text-text">
        Did we hear you right?
      </h2>
      <div className="mt-6 w-full max-h-55 overflow-y-auto rounded-2xl border border-border bg-canvas p-4 text-left scrollbar-hide">
        {text.trim() ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text">
            {text}
          </p>
        ) : (
          <p className="text-[15px] leading-relaxed text-muted">
            Transcript will appear here after transcription completes.
          </p>
        )}
      </div>
      <div className="mt-3 flex w-full items-center justify-between text-xs text-muted">
        <span className="capitalize tracking-[0.06em]">{meta}</span>
        <button
          type="button"
          onClick={onEdit}
          disabled={editDisabled || busy}
          className="font-medium text-gold disabled:cursor-not-allowed disabled:text-muted disabled:opacity-60"
        >
          Edit text
        </button>
      </div>
      {error ? <p className="mt-3 text-xs text-red">{error}</p> : null}
      <div className="mt-6 flex w-full flex-col gap-3">
        <Button fullWidth disabled={!text.trim() || busy} onClick={onRun}>
          {busy ? "Starting…" : "Run Pipeline →"}
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={onReRecord}
          disabled={busy}
        >
          Re-record instead
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted text-center">
        The modal closes and the run continues in your workspace.
      </p>
    </div>
  );
};

export const CaptureMicBlockedState = ({
  onRetry,
  onType,
}: {
  onRetry: () => void;
  onType: () => void;
}) => (
  <div className="flex flex-col items-center text-center">
    <span className="inline-flex items-center gap-2 text-[9px] font-medium tracking-[0.14em] text-text-secondary uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-red" />
      Microphone blocked
    </span>
    <div className="relative mt-[30px] grid h-24 w-24 place-items-center rounded-full bg-canvas text-muted">
      <IconMicOff size={28} />
    </div>
    <h2 className="mt-[26px] font-serif text-[28px] leading-[1.2] text-text">
      Listener needs your microphone
    </h2>
    <p className="mt-3 max-w-[36ch] text-[13px] leading-[1.7] text-text-secondary">
      Your browser is blocking it. Click the mic icon in the address bar and
      choose <span className="font-semibold text-text">Allow</span>, then come
      back here.
    </p>
    <Button
      variant="outline"
      fullWidth
      className="mt-[26px] !min-h-12"
      onClick={onRetry}
    >
      Try again
    </Button>
    <div className="mt-[22px] h-px w-full bg-border" />
    <button
      type="button"
      onClick={onType}
      className="mt-[18px] text-[13px] font-medium text-gold-deep hover:brightness-110"
    >
      Or type it instead
    </button>
  </div>
);

const TRANSCRIBE_BAR_HEIGHTS = [40, 56, 30, 64, 44, 58, 34, 50, 26, 42];

export const CaptureTranscribingState = ({
  durationSeconds,
}: {
  durationSeconds: number;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="mt-4 flex h-[72px] items-center justify-center gap-[5px]">
      {TRANSCRIBE_BAR_HEIGHTS.map((height, i) => (
        <span
          key={i}
          className="w-[3px] origin-center rounded-full bg-gold motion-safe:animate-capture-bar"
          style={{
            height: `${height}px`,
            animationDelay: `${i * 0.1}s`,
            opacity:
              i === 0 || i === TRANSCRIBE_BAR_HEIGHTS.length - 1 ? 0.45 : 1,
          }}
        />
      ))}
    </div>
    <h2 className="mt-10 font-serif text-[30px] leading-[1.2] text-text">
      Transcribing your recording
    </h2>
    <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
      Turning your voice into words.
    </p>
    <div className="mt-[30px] h-[3px] w-[180px] overflow-hidden rounded-full bg-gold-15">
      <div className="h-full w-[64%] rounded-full bg-gold" />
    </div>
    <p className="mt-11 text-xs text-muted">
      A few seconds — {formatTime(durationSeconds)} of audio.
    </p>
  </div>
);

export const CaptureAtlassianGateState = ({
  onConnect,
}: {
  onConnect: () => void;
}) => (
  <div className="flex flex-col">
    <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
      Before the run
    </p>
    <div className="mt-5 flex items-center gap-3.5">
      <span
        className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-gold-10"
        aria-hidden
      >
        <span className="block size-4 rotate-45 rounded-[3px] bg-gold" />
      </span>
      <h2 className="min-w-0 font-serif text-[28px] leading-[1.15] text-text text-pretty">
        Connect Atlassian to continue
      </h2>
    </div>
    <p className="mt-4 text-[13px] leading-[1.7] text-text-secondary text-pretty">
      Listener builds your Jira board and Confluence space directly in your own
      workspace. Connect to run — your transcript stays right here.
    </p>
    <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
      <p className="text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
        Needs your workspace
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {["Roadmap", "Jira", "Confluence"].map((label) => (
          <span
            key={label}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-text-secondary"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-muted">
        Three of the eight artifacts are created there, so the run waits for the
        connection.
      </p>
    </div>
    <Button fullWidth className="mt-5 !min-h-12" onClick={onConnect}>
      Connect Atlassian
    </Button>
    <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted">
      Opens Atlassian&apos;s consent screen · about a minute
    </p>
    <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border px-3.5 py-3 text-xs leading-relaxed text-text-secondary text-pretty">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      <span className="min-w-0">
        Your transcript is saved. Close this and it&apos;ll be waiting.
      </span>
    </div>
  </div>
);

export const CaptureQuotaState = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="flex flex-col items-center text-center">
    <span className="rounded-full bg-gold-10 px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-gold uppercase">
      Free plan
    </span>
    <div className="mt-8 flex items-center gap-2.5">
      <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-gold text-white">
        <span className="mb-0.5 block h-1.5 w-2.5 rotate-[-45deg] border-b-2 border-l-2 border-white" />
      </span>
      <span className="h-[34px] w-[34px] rounded-full border border-dashed border-dashed-border bg-canvas" />
      <span className="h-[34px] w-[34px] rounded-full border border-dashed border-dashed-border bg-canvas" />
    </div>
    <h2 className="mt-7 font-serif text-[30px] leading-[1.2] text-text">
      You&apos;ve used your free idea
    </h2>
    <p className="mt-3 max-w-[34ch] text-[13px] leading-[1.7] text-text-secondary">
      Free access includes one idea. Paid plans are coming soon — you&apos;ll be
      able to keep building then.
    </p>
    <div className="mt-6 flex w-full items-center gap-3 rounded-xl bg-canvas px-4 py-3.5 text-left text-xs leading-relaxed text-text-secondary">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      Everything you&apos;ve already built stays in your workspace.
    </div>
    <Button
      variant="secondary"
      fullWidth
      className="mt-6 !min-h-12"
      onClick={onDismiss}
    >
      Got it
    </Button>
    <p className="mt-3.5 text-xs text-muted">
      We&apos;ll email you when plans open.
    </p>
  </div>
);

export const CaptureTypedState = ({
  value,
  onChange,
  project,
  projectPickerOpen,
  onProjectPickerOpenChange,
  onContinue,
  onRecord,
}: {
  value: string;
  onChange: (v: string) => void;
  project: CaptureProjectControls;
  projectPickerOpen: boolean;
  onProjectPickerOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onRecord: () => void;
}) => (
  <div className="flex flex-col">
    <p className="text-center text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
      New idea · Typed
    </p>
    <h2 className="mt-3 text-center font-serif text-[26px] leading-tight text-text">
      Write it down instead
    </h2>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, 600))}
      placeholder="Type your idea..."
      rows={6}
      className="mt-6 w-full resize-none rounded-2xl border border-gold/40 bg-surface p-4 text-[15px] text-text outline-none placeholder:text-muted focus:shadow-[0_0_0_2px_var(--gold-30)]"
    />
    <p className="mt-2 text-sm text-text-secondary">
      A sentence or two is plenty — say what it does and who it&apos;s for.
    </p>
    <div className="mt-4 flex items-center justify-between gap-3">
      <CaptureProjectField
        project={project}
        open={projectPickerOpen}
        onOpenChange={onProjectPickerOpenChange}
      />
      <span className="text-xs text-muted">{value.length} / 600</span>
    </div>
    <Button
      fullWidth
      className="mt-6"
      disabled={value.trim().length === 0}
      onClick={onContinue}
    >
      Continue →
    </Button>
    <button
      type="button"
      onClick={onRecord}
      className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-gold-deep uppercase hover:brightness-110"
    >
      Record instead
    </button>
  </div>
);

export const CaptureEmptyTakeState = ({
  onRecord,
  onType,
}: {
  onRecord: () => void;
  onType: () => void;
}) => (
  <div className="flex flex-col items-center text-center">
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[9px] font-medium tracking-[0.14em] text-text-secondary uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-red" />
      Nothing recorded
    </span>
    <div className="mt-9 flex h-14 items-center justify-center gap-[5px]">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="h-1 w-[3px] rounded-full bg-[#D8D5CE]" />
      ))}
    </div>
    <h2 className="mt-6 font-serif text-[26px] leading-tight text-text">
      We didn&apos;t catch that
    </h2>
    <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-text-secondary">
      The take came back empty — give it another go, a little closer to the mic.
    </p>
    <Button fullWidth className="mt-8" onClick={onRecord}>
      Record again
    </Button>
    <button
      type="button"
      onClick={onType}
      className="mt-4 text-[11px] font-medium tracking-[0.14em] text-muted uppercase hover:text-gold"
    >
      Or type it instead
    </button>
  </div>
);

/** Kickoff hit run_in_progress — idea may be saved; run was not created. */
export const CaptureRunBlockedState = ({
  ideaSaved,
  onDismiss,
}: {
  ideaSaved: boolean;
  onDismiss: () => void;
}) => (
  <div className="text-center">
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden />
      <span className="text-[9px] font-medium tracking-[0.14em] text-text-secondary uppercase">
        Not started
      </span>
    </span>

    <h2
      id="capture-modal-title"
      className="mt-8 font-serif text-[29px] leading-[1.2] text-text"
    >
      A run is already in progress
    </h2>
    <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
      Listener builds one idea at a time, so this one hasn&apos;t started.
      {ideaSaved ? " It’s saved — start it once the current run finishes." : ""}
    </p>

    <button
      type="button"
      onClick={onDismiss}
      className="mt-7 h-12 w-full rounded-xl border border-border text-sm font-medium text-text transition hover:bg-canvas"
    >
      Got it
    </button>
    <Link
      href="/projects"
      onClick={onDismiss}
      className="mt-3.5 inline-block text-xs font-medium text-gold-deep hover:text-text"
    >
      See what’s running →
    </Link>
  </div>
);
