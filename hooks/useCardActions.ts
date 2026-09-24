"use client";

import { trackPaneAction } from "@/lib/analytics/events";
import { copyText } from "@/lib/desktop/clipboard";
import { downloadBrandKit } from "@/lib/ideas/brand-kit";
import {
  canDownloadDoc,
  downloadCardDoc,
  formatTechStackMarkdown,
  getCardDocMarkdown,
  type DownloadableDoc,
} from "@/lib/ideas/document-download";
import type { M1CardId } from "@/types/ideas";
import type { RunResults } from "@/types/run-results";
import { useCallback, useEffect, useRef, useState } from "react";

export type CardAction = {
  key: string;
  label: string;
  onClick: () => void;
};

const DOWNLOADABLE_DOC_IDS: DownloadableDoc[] = [
  "transcript",
  "competitor",
  "prd",
  "engineering",
];

const isDownloadableDoc = (id: M1CardId): id is DownloadableDoc =>
  DOWNLOADABLE_DOC_IDS.includes(id as DownloadableDoc);

const COPIED_MS = 1600;

/**
 * Download / Copy actions for a done-run card's footer — same lib calls as
 * the desktop reading panes, tracked on the mobile surface.
 */
const useCardActions = (runResults: RunResults | null) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(
    async (key: string, pane: M1CardId, text: string | null) => {
      if (!text) return;
      const ok = await copyText(text);
      if (!ok) return;
      trackPaneAction("copy", "mobile", { pane });
      setCopiedKey(key);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopiedKey(null), COPIED_MS);
    },
    []
  );

  const actionsFor = (id: M1CardId): CardAction[] => {
    if (!runResults) return [];

    if (id === "brand") {
      const brand = runResults.brand;
      if (!brand) return [];
      return [
        {
          key: "brand:download",
          label: "↓ Download brand kit",
          onClick: () => {
            trackPaneAction("download", "mobile", { pane: "brand" });
            void downloadBrandKit(brand);
          },
        },
      ];
    }

    if (!isDownloadableDoc(id) || !canDownloadDoc(id, runResults)) return [];

    const copyKey = `${id}:copy`;
    const copied = copiedKey === copyKey;
    const actions: CardAction[] = [
      {
        key: `${id}:download`,
        label: "↓ Download .md",
        onClick: () => {
          downloadCardDoc(id, runResults);
          trackPaneAction("download", "mobile", { pane: id });
        },
      },
    ];

    if (id === "engineering") {
      const stack = formatTechStackMarkdown(runResults.engineering?.techStack);
      if (stack) {
        actions.push({
          key: copyKey,
          label: copied ? "Copied" : "Copy stack",
          onClick: () => void copy(copyKey, id, stack),
        });
      }
      return actions;
    }

    actions.push({
      key: copyKey,
      label: copied ? "Copied" : "Copy",
      onClick: () => void copy(copyKey, id, getCardDocMarkdown(id, runResults)),
    });
    return actions;
  };

  return { actionsFor };
};

export default useCardActions;
