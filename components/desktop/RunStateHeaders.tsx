/** Queued header + pane variants — ADR-039 honesty (no false stage-1). */

export const QueuedState = {
  Header: ({ position }: { position: number | null }) => (
    <div className="mt-4">
      <p className="text-[13px] font-medium tracking-[0.08em] text-text uppercase">
        ○ Queued
        {position != null ? ` · position ${position}` : ""}
      </p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
        Nothing is running yet. No stage is lit, no bar is filling — the run
        starts when the queue clears.
      </p>
    </div>
  ),
};

export const FailedState = {
  Header: ({ label }: { label: string }) => (
    <p className="mt-4 text-sm text-red">
      Failed while {label.toLowerCase()}.{" "}
      <span className="text-muted">
        TODO: wire resume via lib/murmur/client resumePipelineRun.
      </span>
    </p>
  ),
};
