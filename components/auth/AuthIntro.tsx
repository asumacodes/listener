import AuthHeadline from "@/components/auth/AuthHeadline";
import { copy } from "@/lib/design/copy";

/** Sign-in title + lead — centered above the form. */
const AuthIntro = () => (
  <div className="flex flex-col items-center text-center">
    <AuthHeadline />
    <p className="mt-2.5 max-w-[280px] text-[15px] leading-relaxed text-text-secondary">
      {copy.auth.lead}
    </p>
  </div>
);

export default AuthIntro;
