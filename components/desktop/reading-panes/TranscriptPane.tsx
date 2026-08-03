"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import { PaneAction } from "@/components/desktop/reading-panes/PaneAction";
import { useCaptureLauncher } from "@/components/desktop/CaptureLauncherContext";
import { copyText } from "@/lib/desktop/clipboard";
import { formatRecordedAt } from "@/lib/format-date";
import { countWords } from "@/lib/format";
import { withRecordingTranscript } from "@/lib/ideas/document-download";
import { M1_CARDS } from "@/lib/ideas/cards";
import type { IdeaDetailData } from "@/types/ideas";
import { useState } from "react";

type TranscriptPaneProps = {
  data: IdeaDetailData;
  streaming?: boolean;
  canKickoff?: boolean;
};

const firstSentence = (text: string): { lead: string; rest: string } => {
  const trimmed = text.trim();
  const match = trimmed.match(/^(.+?[.!?])(\s+|$)/);
  if (!match) return { lead: trimmed, rest: "" };
  return { lead: match[1], rest: trimmed.slice(match[0].length).trim() };
};

const downloadTranscriptTxt = (text: string, title: string) => {
  const slug =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "transcript";
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}-transcript.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const mutedAction =
  "!border-border !text-text-secondary hover:!border-border hover:!bg-canvas hover:!text-text";

const TranscriptPane = ({
  data,
  streaming = false,
  canKickoff = true,
}: TranscriptPaneProps) => {
  const { openCapture } = useCaptureLauncher();
  const [copied, setCopied] = useState(false);
  const results = withRecordingTranscript(
    data.latestRunResults,
    data.recording.transcription
  );
  const text =
    results?.transcript?.trim() || data.recording.transcription.trim() || "";
  const words = countWords(text);
  const { lead, rest } = text ? firstSentence(text) : { lead: "", rest: "" };
  const recorded = formatRecordedAt(data.recording.createdAt) || "—";

  const onDownload = () => {
    if (!text) return;
    downloadTranscriptTxt(text, data.recording.title);
  };

  const onCopy = async () => {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const onEdit = () => {
    if (!canKickoff) return;
    openCapture({ initialText: text, startIn: "typed" });
  };

  return (
    <ReadingPane
      variant="prose"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 01 · ${M1_CARDS.transcript.title}`}
      title={M1_CARDS.transcript.title}
      meta={
        text ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
              {data.recording.durationSeconds} seconds
              <span className="mx-2 text-border" aria-hidden>
                |
              </span>
              {words} words
              <span className="mx-2 text-border" aria-hidden>
                |
              </span>
              Recorded {recorded}
            </p>
            <p className="text-[11px] leading-snug text-muted">
              Editing this and running again produces new artifacts.
            </p>
          </div>
        ) : null
      }
      actions={
        <>
          <PaneAction disabled={!text} onClick={onDownload}>
            ↓ Download .txt
          </PaneAction>
          <PaneAction
            disabled={!text}
            className={mutedAction}
            onClick={() => void onCopy()}
          >
            {copied ? "Copied" : "Copy"}
          </PaneAction>
          <PaneAction
            disabled={!text || !canKickoff}
            className={mutedAction}
            title={
              canKickoff
                ? "Uses 1 idea — opens typed capture for a new run"
                : "You've used your free idea"
            }
            onClick={onEdit}
          >
            Edit text
          </PaneAction>
        </>
      }
    >
      {text ? (
        <div className="space-y-5">
          <p className="font-serif text-[22px] leading-[1.45] text-text">
            {lead}
            {streaming ? (
              <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-gold align-middle" />
            ) : null}
          </p>
          {rest ? (
            <p className="whitespace-pre-wrap font-serif text-[17px] leading-[1.55] text-text">
              {rest}
            </p>
          ) : null}
          <div className="rounded-2xl border border-border bg-[#F7F4EE] px-4 py-3.5">
            <p className="flex items-start gap-2 text-[13px] leading-relaxed text-text-secondary">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                aria-hidden
              />
              Everything to the left of this pane grew from these {words} words.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">No transcript yet.</p>
      )}
    </ReadingPane>
  );
};

export default TranscriptPane;
