export const deleteRun = async (runId: string): Promise<void> => {
  const response = await fetch(`/api/murmur/runs/${runId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      `Failed to delete run: ${body?.error ?? response.statusText}`
    );
  }
};
