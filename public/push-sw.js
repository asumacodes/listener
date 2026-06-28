/* Imported into the next-pwa-generated service worker via importScripts. */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Murmur";
  const body =
    payload.body ||
    (payload.type === "RUN_FAILED"
      ? "A run needs your attention."
      : "Your project is ready.");
  const url = payload.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const focusedOnRun = clientsList.some(
        (client) =>
          client.visibilityState === "visible" &&
          payload.runId &&
          client.url.includes(payload.runId)
      );

      if (focusedOnRun) {
        clientsList.forEach((client) =>
          client.postMessage({ kind: "push-suppressed", payload })
        );
        return;
      }

      await self.registration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: payload.runId ? `run-${payload.runId}` : "murmur-run",
        data: { url },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = clientsList.find((client) => "focus" in client);

      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await existing.navigate(target);
        return;
      }

      await self.clients.openWindow(target);
    })()
  );
});
