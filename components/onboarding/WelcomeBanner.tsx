"use client";

import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

type WelcomeBannerProps = {
  title: string;
  body: string;
  onDismiss: () => void;
  dismissLabel?: string;
};

const WelcomeBanner = ({
  title,
  body,
  onDismiss,
  dismissLabel,
}: WelcomeBannerProps) => (
  <div
    role="region"
    aria-label={title}
    className={`${ui.card} relative shrink-0 px-6 py-5 pr-12`}
  >
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss"
      className="absolute top-3.5 right-4 text-[15px] text-muted transition hover:text-text"
    >
      ×
    </button>
    <h2 className="font-serif text-[22px] leading-tight tracking-[-0.01em] text-text">
      {title}
    </h2>
    <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-text-secondary">
      {body}
    </p>
    <button type="button" onClick={onDismiss} className={`${ui.textLink} mt-3`}>
      {dismissLabel ?? copy.welcome.dismiss}
    </button>
  </div>
);

export default WelcomeBanner;
