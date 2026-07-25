import { copy } from "@/lib/design/copy";

const AuthHeadline = () => (
  <h1 className="auth-hero font-serif text-[34px] leading-[1.15] tracking-[-0.01em] text-text">
    {copy.auth.headline}
  </h1>
);

export default AuthHeadline;
