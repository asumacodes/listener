"use client";

import AuthSpinner from "@/components/auth/AuthSpinner";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { copy } from "@/lib/design/copy";
import type { QuotaNudgeView } from "@/lib/billing/quotaNudge";

type QuotaNudgeProps = {
  view: QuotaNudgeView;
  align?: "start" | "center";
  busy: boolean;
  error: string | null;
  titleId: string;
  onClearError: () => void;
  onDismiss: () => void;
  onSubscribe: () => void;
  onTopUp: () => void;
  onUpgrade: () => void;
};

const QuotaNudge = ({
  view,
  align = "start",
  busy,
  error,
  titleId,
  onClearError,
  onDismiss,
  onSubscribe,
  onTopUp,
  onUpgrade,
}: QuotaNudgeProps) => {
  const centered = align === "center";
  const frame = centered ? "flex flex-col items-center text-center" : "";
  const titleClass = centered
    ? "font-serif text-[30px] leading-[1.2] text-text"
    : "font-serif text-2xl leading-tight text-text";
  const bodyClass = centered
    ? "mt-3 max-w-[34ch] text-[13px] leading-[1.7] text-text-secondary"
    : "mt-2.5 text-[15px] leading-relaxed text-text-secondary";
  const actionsClass = centered
    ? "mt-6 flex w-full flex-col gap-3"
    : "mt-6 flex flex-col gap-3";
  const priceClass = centered
    ? "text-[13px] text-text-secondary"
    : "text-[14px] text-text-secondary";

  const toast = error ? (
    <Toast message={error} onDismiss={onClearError} />
  ) : null;

  if (view.kind === "loading") {
    return (
      <div className={frame} role="status" aria-labelledby={titleId}>
        {toast}
        <h2 id={titleId} className={titleClass}>
          {copy.outOfQuota.checking}
        </h2>
        <div className={centered ? "mt-8" : "mt-6"}>
          <AuthSpinner className={centered ? "mx-auto" : ""} />
        </div>
      </div>
    );
  }

  if (view.kind === "subscribe") {
    return (
      <div className={frame} role="alertdialog" aria-labelledby={titleId}>
        {toast}
        <h2 id={titleId} className={titleClass}>
          {copy.outOfQuota.subscribeTitle}
        </h2>
        <p className={bodyClass}>{copy.outOfQuota.subscribeBody}</p>
        <div className={actionsClass}>
          <Button fullWidth disabled={busy} onClick={onSubscribe}>
            {copy.outOfQuota.choosePlan}
          </Button>
          <Button variant="secondary" fullWidth onClick={onDismiss}>
            {copy.outOfQuota.dismiss}
          </Button>
        </div>
      </div>
    );
  }

  if (view.kind === "topup") {
    const studioOnly = view.nextTier === null;
    return (
      <div className={frame} role="alertdialog" aria-labelledby={titleId}>
        {toast}
        <h2 id={titleId} className={titleClass}>
          {copy.outOfQuota.topupTitle}
        </h2>
        <p className={bodyClass}>
          {studioOnly
            ? copy.outOfQuota.topupStudioBody
            : copy.outOfQuota.topupBody}
        </p>
        <div className={actionsClass}>
          <div>
            <Button fullWidth disabled={busy} onClick={onTopUp}>
              {copy.checkout.topUp}
            </Button>
            <p className={`mt-2 ${priceClass}`}>{view.topUpPrice}</p>
          </div>
          {view.nextTier && view.nextPrice ? (
            <div>
              <Button
                variant="secondary"
                fullWidth
                disabled={busy}
                onClick={onUpgrade}
              >
                {copy.checkout.upgrade}
              </Button>
              <p className={`mt-2 ${priceClass}`}>
                {copy.checkout.packs[view.nextTier]} · {view.nextPrice}
              </p>
            </div>
          ) : null}
          <Button variant="ghost" fullWidth onClick={onDismiss}>
            {copy.outOfQuota.dismiss}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={frame} role="alertdialog" aria-labelledby={titleId}>
      {toast}
      <h2 id={titleId} className={titleClass}>
        {copy.outOfQuota.title}
      </h2>
      <p className={bodyClass}>{copy.outOfQuota.body}</p>
      <div className={actionsClass}>
        <Button fullWidth onClick={onDismiss}>
          {copy.outOfQuota.dismiss}
        </Button>
      </div>
    </div>
  );
};

export default QuotaNudge;
