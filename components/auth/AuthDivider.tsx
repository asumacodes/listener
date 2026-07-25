import { copy } from "@/lib/design/copy";

/** Visual split between phone OTP and OAuth on the login screen. */
const AuthDivider = () => (
  <div className="flex items-center gap-3" role="separator">
    <div className="h-px flex-1 bg-border" />
    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
      {copy.auth.divider}
    </span>
    <div className="h-px flex-1 bg-border" />
  </div>
);

export default AuthDivider;
