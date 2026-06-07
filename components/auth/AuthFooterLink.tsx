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
    <p className="mt-6 text-center text-[14px] leading-normal text-text-secondary">
      {prompt}{" "}
      <button
        type="button"
        onClick={() => onSwitch(nextMode)}
        className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[14px] font-medium text-gold hover:brightness-110"
      >
        {linkLabel}
      </button>
    </p>
  );
};

export default AuthFooterLink;
