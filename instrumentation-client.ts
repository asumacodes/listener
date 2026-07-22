// Next.js App Router client instrumentation entry — loads shared client Sentry init.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import "./sentry.client.config";

export { onRouterTransitionStart } from "./sentry.client.config";
