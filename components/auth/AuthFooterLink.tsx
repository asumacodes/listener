import { copy } from "@/lib/design/copy";
import type { AuthMode } from "@/types";

type AuthFooterLinkProps = {
  mode: AuthMode;
  onSwitch: (mode: AuthMode) => void;
};

const AuthFooterLink = ({ mode, onSwitch }: AuthFooterLinkProps) => {
  const isSignIn = mode === "signin";
  const prompt = isSignIn
    ? copy.auth.signIn.footerPrompt
    : copy.auth.signUp.footerPrompt;
  const linkLabel = isSignIn
    ? copy.auth.signIn.footerLink
    : copy.auth.signUp.footerLink;
  const nextMode = isSignIn ? "signup" : "signin";

  return (
    <p className="auth-foot mt-5 text-center text-sm text-text-secondary">
      {prompt}{" "}
      <button
        type="button"
        onClick={() => onSwitch(nextMode)}
        className="type-textlink hover:brightness-110"
      >
        {linkLabel}
      </button>
    </p>
  );
};

export default AuthFooterLink;
