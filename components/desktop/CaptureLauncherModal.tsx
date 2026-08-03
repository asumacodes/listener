"use client";

import { useCaptureLauncher } from "@/components/desktop/CaptureLauncherContext";
import Button from "@/components/ui/Button";
import { IconMic } from "@/components/icons/ListenerIcons";
import { countWords } from "@/lib/format";
import { silentWebmBlob } from "@/lib/media/silent-blob";
import { startPipelineRun } from "@/lib/murmur/client";
import { saveRecording } from "@/lib/recordings/client";
import { useRouter } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/**
 * Capture modal state machine — Set 1 depth A:
 * idle is interactive; typed path can save + kick off a new run.
 * Voice MediaRecorder / whisper remain TODOs.
 */
export type CaptureModalState =
  | "idle"
  | "recording"
  | "review"
  | "transcript"
  | "mic-blocked"
  | "transcribing"
  | "atlassian-gate"
  | "quota"
  | "typed"
  | "empty-take";

const EDGE_STATES: CaptureModalState[] = [
  "mic-blocked",
  "transcribing",
  "atlassian-gate",
  "quota",
  "typed",
  "empty-take",
];

const CaptureLauncherModal = () => {
  const { open, closeCapture, initialText, startIn } = useCaptureLauncher();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [state, setState] = useState<CaptureModalState>("idle");
  const [typedText, setTypedText] = useState("");
  const [transcriptBody, setTranscriptBody] = useState("");
  const [kickoffBusy, setKickoffBusy] = useState(false);
  const [kickoffError, setKickoffError] = useState<string | null>(null);
  // TODO: wire to current project from home tabs / useProjectPicker
  const [projectLabel] = useState("Uncategorised");
  const [wasOpen, setWasOpen] = useState(open);
  const [seededOpen, setSeededOpen] = useState(false);

  // Reset machine when the modal closes; seed typed prefill when it opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setState("idle");
      setTypedText("");
      setTranscriptBody("");
      setKickoffBusy(false);
      setKickoffError(null);
      setSeededOpen(false);
    } else {
      setSeededOpen(false);
    }
  }

  if (open && !seededOpen) {
    setSeededOpen(true);
    if (startIn === "typed") {
      setTypedText(initialText);
      setTranscriptBody(initialText);
      setState("typed");
    }
  }

  const onDismiss = useCallback(() => {
    closeCapture();
  }, [closeCapture]);

  const runTypedPipeline = async () => {
    const text = transcriptBody.trim() || typedText.trim();
    if (!text || kickoffBusy) return;
    setKickoffBusy(true);
    setKickoffError(null);
    try {
      const { recordingId } = await saveRecording({
        blob: silentWebmBlob(),
        mimeType: "audio/webm",
        durationSeconds: 0,
        transcription: text,
        language: null,
      });
      const result = await startPipelineRun(recordingId);
      if (!result.ok) {
        if (result.reason === "out_of_quota") {
          setState("quota");
          return;
        }
        setKickoffError(
          result.reason === "cost_halt"
            ? "New ideas are paused for a little while. Try again later today."
            : "Couldn't start the pipeline. Try again."
        );
        return;
      }
      closeCapture();
      router.push(`/ideas/${recordingId}`);
      router.refresh();
    } catch {
      setKickoffError("Couldn't save this idea. Try again.");
    } finally {
      setKickoffBusy(false);
    }
  };

  if (!mounted || !open) return null;

  const isEdge = EDGE_STATES.includes(state);
  const shellClass = isEdge
    ? "relative w-[min(420px,calc(100vw-2rem))] rounded-3xl border border-border bg-surface px-[34px] pt-9 pb-[30px] shadow-[0_24px_80px_rgba(26,26,26,0.22)]"
    : "relative w-[min(520px,calc(100vw-2rem))] rounded-3xl border border-border bg-surface px-8 pt-9 pb-8 shadow-toast";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Close capture"
        className="absolute inset-0 cursor-default bg-[var(--scrim)]"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-modal-title"
        className={shellClass}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute top-[18px] right-5 text-[15px] text-muted transition hover:text-text"
        >
          ×
        </button>

        {state === "idle" ? (
          <IdleState
            projectLabel={projectLabel}
            onRecord={() => {
              // TODO: request mic + MediaRecorder — on deny → mic-blocked
              setState("recording");
            }}
            onType={() => setState("typed")}
          />
        ) : null}

        {state === "recording" ? (
          <RecordingState
            onStop={() => {
              // TODO: stop recorder; empty blob → empty-take; else → review
              setState("review");
            }}
          />
        ) : null}

        {state === "review" ? (
          <ReviewState
            onConfirm={() => {
              // TODO: upload + transcribe → transcribing → transcript
              setState("transcribing");
              window.setTimeout(() => setState("transcript"), 1200);
            }}
            onReRecord={() => setState("recording")}
          />
        ) : null}

        {state === "transcript" ? (
          <TranscriptState
            text={transcriptBody}
            busy={kickoffBusy}
            error={kickoffError}
            onRun={() => void runTypedPipeline()}
            onEdit={() => setState("typed")}
            onReRecord={() => setState("recording")}
          />
        ) : null}

        {state === "mic-blocked" ? (
          <MicBlockedState
            onRetry={() => setState("idle")}
            onType={() => setState("typed")}
          />
        ) : null}

        {state === "transcribing" ? <TranscribingState /> : null}

        {state === "atlassian-gate" ? (
          <AtlassianGateState
            onConnect={() => {
              // TODO: reuse /api/integrations/atlassian/start?mode=popup
              window.open(
                "/api/integrations/atlassian/start?mode=popup",
                "atlassian_oauth",
                "width=520,height=720"
              );
            }}
          />
        ) : null}

        {state === "quota" ? <QuotaState onDismiss={onDismiss} /> : null}

        {state === "typed" ? (
          <TypedState
            value={typedText}
            onChange={setTypedText}
            projectLabel={projectLabel}
            onContinue={() => {
              setTranscriptBody(typedText);
              setState("transcript");
            }}
            onRecord={() => setState("idle")}
          />
        ) : null}

        {state === "empty-take" ? (
          <EmptyTakeState
            onRecord={() => setState("recording")}
            onType={() => setState("typed")}
          />
        ) : null}
      </div>
    </div>,
    document.body
  );
};

const IdleState = ({
  projectLabel,
  onRecord,
  onType,
}: {
  projectLabel: string;
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
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm text-text-secondary"
      >
        {projectLabel} ▾
      </button>
      <button
        type="button"
        onClick={onType}
        className="text-[11px] font-medium tracking-[0.14em] text-gold-deep uppercase hover:brightness-110"
      >
        Or type it instead
      </button>
    </div>
  </div>
);

const RecordingState = ({ onStop }: { onStop: () => void }) => (
  <div className="flex flex-col items-center text-center">
    <span className="inline-flex items-center gap-2 rounded-full border border-red/20 bg-error-surface px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-red uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-red" />
      Recording
    </span>
    <p className="mt-8 font-serif text-5xl tracking-tight text-text">0:03</p>
    {/* TODO: mount WaveformVisualizer with live stream */}
    <div className="mt-6 flex h-8 w-full items-end justify-center gap-1">
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-gold/70"
          style={{ height: `${8 + ((i * 7) % 20)}px` }}
        />
      ))}
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

const ReviewState = ({
  onConfirm,
  onReRecord,
}: {
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
    {/* TODO: mount AudioPlayer with recorded blob URL */}
    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-canvas px-4 py-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-white">
        ▶
      </span>
      <div className="h-1 flex-1 rounded-full bg-gold/20">
        <div className="h-full w-1/3 rounded-full bg-gold" />
      </div>
      <span className="text-xs text-muted">0:05 / 0:18</span>
    </div>
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

const TranscriptState = ({
  text,
  busy,
  error,
  onRun,
  onEdit,
  onReRecord,
}: {
  text: string;
  busy?: boolean;
  error?: string | null;
  onRun: () => void;
  onEdit: () => void;
  onReRecord: () => void;
}) => (
  <div className="flex flex-col">
    <p className="text-center text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
      Transcript
    </p>
    <h2 className="mt-3 text-center font-serif text-[26px] leading-tight text-text">
      Did we hear you right?
    </h2>
    <div className="mt-6 max-h-[220px] overflow-y-auto rounded-2xl border border-border bg-canvas p-4 text-left text-[15px] leading-relaxed text-text">
      {text.trim() ? (
        <p className="whitespace-pre-wrap">{text}</p>
      ) : (
        <p className="text-muted">
          Transcript will appear here after transcription completes.
        </p>
      )}
    </div>
    <div className="mt-3 flex items-center justify-between text-xs text-muted">
      <span>{countWords(text)} words</span>
      <button type="button" className="font-medium text-gold" onClick={onEdit}>
        Edit text
      </button>
    </div>
    {error ? (
      <p className="mt-3 text-center text-xs text-red">{error}</p>
    ) : null}
    <div className="mt-6 flex flex-col gap-3">
      <Button fullWidth disabled={!text.trim() || busy} onClick={onRun}>
        {busy ? "Starting…" : "Run Pipeline →"}
      </Button>
      <Button variant="outline" fullWidth onClick={onReRecord} disabled={busy}>
        Re-record instead
      </Button>
    </div>
    <p className="mt-4 text-center text-xs text-muted">
      Uses 1 idea · creates a new recording and run
    </p>
  </div>
);

const MicBlockedState = ({
  onRetry,
  onType,
}: {
  onRetry: () => void;
  onType: () => void;
}) => (
  <div className="flex flex-col items-center text-center">
    <span className="inline-flex items-center gap-2 rounded-full bg-transparent px-0 py-0 text-[9px] font-medium tracking-[0.14em] text-text-secondary uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-red" />
      Microphone blocked
    </span>
    <div className="relative mt-[30px] grid h-24 w-24 place-items-center rounded-full bg-canvas text-muted">
      <IconMic size={28} />
    </div>
    <h2 className="mt-[26px] font-serif text-[28px] leading-[1.2] text-text">
      Listener needs your microphone
    </h2>
    <p className="mt-3 max-w-[36ch] text-[13px] leading-[1.7] text-text-secondary">
      Your browser is blocking it. Click the mic icon in the address bar and
      choose Allow, then come back here.
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
      className="mt-[18px] text-[11px] font-medium tracking-[0.14em] text-gold-deep uppercase hover:brightness-110"
    >
      Or type it instead
    </button>
  </div>
);

const TranscribingState = () => (
  <div className="flex flex-col items-center text-center">
    <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
      Step 1 of 2
    </p>
    <div className="mt-12 flex h-[72px] items-center justify-center gap-[5px]">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className="w-[3px] animate-skeleton-shimmer rounded-full bg-gold"
          style={{ height: `${26 + ((i * 7) % 40)}px` }}
        />
      ))}
    </div>
    <h2 className="mt-8 font-serif text-[28px] leading-[1.2] text-text">
      Transcribing your recording
    </h2>
    <p className="mt-2 text-[13px] text-text-secondary">
      Turning your voice into words.
    </p>
    <div className="mt-8 h-[3px] w-full overflow-hidden rounded-full bg-gold-15">
      <div className="h-full w-2/5 rounded-full bg-gold" />
    </div>
    <p className="mt-3 text-xs text-muted">A few seconds — audio in flight.</p>
  </div>
);

const AtlassianGateState = ({ onConnect }: { onConnect: () => void }) => (
  <div className="flex flex-col">
    <p className="text-center text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
      Before the run
    </p>
    <h2 className="mt-3 text-center font-serif text-[26px] leading-tight text-text">
      <span className="text-gold">◆ </span>
      Connect Atlassian to continue
    </h2>
    <p className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
      Listener builds your Jira board and Confluence space in your workspace.
      Your transcript stays right here.
    </p>
    <div className="mt-6 rounded-2xl border border-border bg-gold-10 px-4 py-4">
      <p className="text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
        Needs your workspace
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Roadmap", "Jira", "Confluence"].map((label) => (
          <span
            key={label}
            className="rounded-full border border-gold/30 bg-surface px-3 py-1 text-xs text-gold"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-text-secondary">
        Three of eight artifacts require this connection.
      </p>
    </div>
    <Button fullWidth className="mt-6" onClick={onConnect}>
      Connect Atlassian
    </Button>
    <p className="mt-3 text-center text-xs text-muted">
      Opens Atlassian&apos;s consent screen · about a minute.
    </p>
    <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-3 text-sm text-text-secondary">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      Your transcript is saved. Close this and it&apos;ll be waiting.
    </div>
  </div>
);

const QuotaState = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="flex flex-col items-center text-center">
    <span className="rounded-full border border-gold/30 bg-gold-10 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-gold uppercase">
      Free plan
    </span>
    <div className="mt-5 flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[10px] text-white">
        ✓
      </span>
      <span className="h-6 w-6 rounded-full border border-dashed border-dashed-border" />
      <span className="h-6 w-6 rounded-full border border-dashed border-dashed-border" />
    </div>
    <h2 className="mt-6 font-serif text-[26px] leading-tight text-text">
      You&apos;ve used your free idea
    </h2>
    <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-text-secondary">
      Free access includes one idea. Paid plans are coming soon.
    </p>
    <div className="mt-6 w-full rounded-xl border border-border bg-gold-10 px-4 py-3 text-left text-sm text-text-secondary">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold" />
      Everything you&apos;ve already built stays in your workspace.
    </div>
    <Button variant="secondary" fullWidth className="mt-8" onClick={onDismiss}>
      Got it
    </Button>
    <p className="mt-3 text-xs text-muted">
      We&apos;ll email you when plans open.
    </p>
  </div>
);

const TypedState = ({
  value,
  onChange,
  projectLabel,
  onContinue,
  onRecord,
}: {
  value: string;
  onChange: (v: string) => void;
  projectLabel: string;
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
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm text-text-secondary"
      >
        {projectLabel} ▾
      </button>
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
      className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase hover:text-gold"
    >
      Record instead
    </button>
  </div>
);

const EmptyTakeState = ({
  onRecord,
  onType,
}: {
  onRecord: () => void;
  onType: () => void;
}) => (
  <div className="flex flex-col items-center text-center">
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-red" />
      Nothing recorded
    </span>
    <div className="mt-8 flex gap-1.5">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-border" />
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

export default CaptureLauncherModal;
