/**
 * Cross-component "the balance moved" ping.
 *
 * `useEntitlementBalance` refetches on its own when a run reaches `done`, but a
 * webhook-delivered grant is invisible to that subscription: it changes
 * `user_entitlements`, not `pipeline_runs`. The plan welcome knows the moment
 * the grant lands, so it tells every mounted reader to refetch — otherwise the
 * rail keeps the pre-checkout count until the next navigation.
 */

const EVENT = "listener:balance-changed";

export const emitBalanceChanged = (): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
};

export const subscribeBalanceChanged = (onChange: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
};
