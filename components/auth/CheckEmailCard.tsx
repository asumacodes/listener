import { MailIcon } from "@/components/auth/ProviderIcons";

type CheckEmailCardProps = {
  email: string;
  isResending: boolean;
  onResend: () => void;
  onBack: () => void;
};

const CheckEmailCard = ({
  email,
  isResending,
  onResend,
  onBack,
}: CheckEmailCardProps) => {
  return (
    <div className="animate-fade-in w-full rounded-2xl border border-black/8 bg-white px-5 py-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-gold-brand">
          <MailIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium text-text-primary">
            Check your email
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            We sent a confirmation link to{" "}
            <span className="font-medium text-text-primary">{email}</span>.
            Click it to finish signing up.
          </p>
          <p className="mt-4 text-xs text-text-muted">
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={onResend}
              disabled={isResending}
              className="font-medium text-gold-brand underline underline-offset-2 disabled:opacity-50"
            >
              {isResending ? "Sending…" : "Resend"}
            </button>
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-xs text-text-muted underline underline-offset-2"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailCard;
