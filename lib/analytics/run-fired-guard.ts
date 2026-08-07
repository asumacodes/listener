const key = (kind: string, runId: string) => `mm_fired:${kind}:${runId}`;

export function hasFired(kind: string, runId: string): boolean {
  try {
    return sessionStorage.getItem(key(kind, runId)) === "1";
  } catch {
    return false;
  }
}

export function markFired(kind: string, runId: string): void {
  try {
    sessionStorage.setItem(key(kind, runId), "1");
  } catch {
    // ignore quota / private-mode failures
  }
}
