export const deleteAccount = async (): Promise<void> => {
  const res = await fetch("/api/account", { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to delete account");
  }
};
