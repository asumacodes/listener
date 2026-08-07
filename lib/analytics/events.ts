import { posthog } from "./posthog-client";

export function trackAuthStarted(provider: "google" | "github" | "phone") {
  posthog?.capture("auth_started", { provider });
}

export function trackAuthCompleted(provider?: string) {
  posthog?.capture("auth_completed", provider ? { provider } : undefined);
}
