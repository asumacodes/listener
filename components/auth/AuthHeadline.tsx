import { copy } from "@/lib/design/copy";
import type { AuthMode } from "@/types";

type AuthHeadlineProps = {
  mode: AuthMode;
};

const AuthHeadline = ({ mode }: AuthHeadlineProps) => {
  const headline =
    mode === "signin" ? copy.auth.signIn.headline : copy.auth.signUp.headline;

  return (
    <h1 className="auth-hero mt-2.5 font-serif text-[36px] leading-[1.15] tracking-[-0.01em] text-text">
      {headline}
    </h1>
  );
};

export default AuthHeadline;
