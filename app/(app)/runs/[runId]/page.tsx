// app/(app)/runs/[runId]/page.tsx
//
// Stub landing for the run dashboard. KAN-36 builds the real dashboard here
// (reads run_results by run_id). KAN-32 only needs this route to exist so
// PIPELINE_DONE has a canonical destination to route toward.

import AppHeader from "@/components/AppHeader";

type PageProps = { params: Promise<{ runId: string }> };

export default async function RunDashboardPage({ params }: PageProps) {
  const { runId } = await params;

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[390px] flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <AppHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-3xl text-text">Results dashboard</h1>
        <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
          Coming soon — this is where your generated PRD, brand kit, and Jira
          board will appear (KAN-36).
        </p>
        <p className="text-[11px] tracking-wide text-text-secondary uppercase">
          Run {runId.slice(0, 8)}
        </p>
      </div>
    </main>
  );
}
