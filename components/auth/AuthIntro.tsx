import { copy } from "@/lib/design/copy";

type AuthIntroProps = {
  headline?: string;
  lead?: string;
};

/** Title + lead — centered above the form. Step-aware via props. */
const AuthIntro = ({
  headline = copy.auth.headline,
  lead = copy.auth.lead,
}: AuthIntroProps) => (
  <div className="flex flex-col items-center text-center">
    <h1 className="auth-hero font-serif text-[34px] leading-[1.15] tracking-[-0.01em] text-text">
      {headline}
    </h1>
    <p className="mt-2.5 max-w-[280px] text-[15px] leading-relaxed text-text-secondary">
      {lead}
    </p>
  </div>
);

export default AuthIntro;
