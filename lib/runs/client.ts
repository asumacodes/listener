export const deleteRun = async (runId: string): Promise<void> => {
  const res = await fetch(`/api/runs/${runId}`, { method: "DELETE" });
  const body = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(body?.error ?? "Failed to delete run");
  }
};
