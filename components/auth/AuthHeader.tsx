import AuthHeadline from "@/components/auth/AuthHeadline";
import { ui } from "@/lib/design/ui";
import { copy } from "@/lib/design/copy";

/** Wordmark + tagline + headline + short lead — one vertical unit. */
const AuthHeader = () => (
  <header className="auth-head flex flex-col items-center text-center">
    <div className="font-serif text-[28px] leading-none tracking-[-0.01em] text-gold">
      Listener
    </div>
    <p className={`${ui.eyebrow} mt-5`}>{copy.auth.tagline}</p>
    <AuthHeadline />
    <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-text-secondary">
      {copy.auth.lead}
    </p>
  </header>
);

export default AuthHeader;
