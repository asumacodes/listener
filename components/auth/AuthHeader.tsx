import AuthHeadline from "@/components/auth/AuthHeadline";
import { ui } from "@/lib/design/ui";
import { copy } from "@/lib/design/copy";
import type { AuthMode } from "@/types";

/** Mockup auth-head: wordmark + tagline eyebrow + hero headline. */
const AuthHeader = ({ mode }: { mode: AuthMode }) => (
  <header className="auth-head flex flex-col items-center text-center">
    <div className="font-serif text-[28px] leading-none tracking-[-0.01em] text-gold">
      Listener
    </div>
    <p className={`${ui.eyebrow} mt-5`}>{copy.auth.tagline}</p>
    <AuthHeadline mode={mode} />
  </header>
);

export default AuthHeader;
