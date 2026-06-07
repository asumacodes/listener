import { MailIcon } from "@/components/auth/ProviderIcons";

import { copy } from "@/lib/design/copy";

type EmailInviteSurfaceProps = {
  email: string;

  isResending: boolean;

  onResend: () => void;

  onBack: () => void;
};

const EmailInviteSurface = ({
  email,

  isResending,

  onResend,

  onBack,
}: EmailInviteSurfaceProps) => (
  <div className="animate-fade-in mx-auto w-full max-w-sm rounded-2xl border border-border bg-surface px-6 py-8 text-center shadow-card">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold-10)] text-gold">
      <MailIcon className="h-6 w-6" />
    </div>

    <h2 className="mt-5 font-serif text-[26px] leading-[1.15] text-text">
      {copy.auth.emailInvite.headline}
    </h2>

    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
      {copy.auth.emailInvite.bodyBefore}{" "}
      <strong className="font-medium text-text">{email}</strong>.{" "}
      {copy.auth.emailInvite.bodyAfter}
    </p>

    <p className="mt-4 text-xs text-muted">
      {copy.auth.emailInvite.resendPrompt}{" "}
      <button
        type="button"
        onClick={onResend}
        disabled={isResending}
        className="type-textlink disabled:opacity-50"
      >
        {isResending
          ? copy.auth.emailInvite.resending
          : copy.auth.emailInvite.resend}
      </button>
    </p>

    <button type="button" onClick={onBack} className="type-textlink mt-5">
      {copy.auth.emailInvite.back}
    </button>
  </div>
);

export default EmailInviteSurface;
