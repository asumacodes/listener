import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { LEGAL_URLS } from "@/lib/legal";

const linkClass = `${ui.textLink} text-[11px]`;

/** Consent line — visible on auth before continuing / verifying. */
const AuthLegalConsent = () => (
  <p className="text-center text-[11px] leading-relaxed text-muted">
    {copy.auth.legalConsentBefore}
    <a
      href={LEGAL_URLS.terms}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {copy.auth.legalTerms}
    </a>
    {copy.auth.legalConsentMid}
    <a
      href={LEGAL_URLS.privacy}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {copy.auth.legalPrivacy}
    </a>
    {copy.auth.legalConsentAfter}
  </p>
);

export default AuthLegalConsent;
