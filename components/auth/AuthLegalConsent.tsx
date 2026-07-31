import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { LEGAL_URLS } from "@/lib/legal";

const linkClass = `${ui.textLink} text-[13px]`;

type AuthLegalConsentProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Required 18+ + Terms & Privacy checkbox on the auth methods screen. */
const AuthLegalConsent = ({
  checked,
  onCheckedChange,
}: AuthLegalConsentProps) => (
  <label
    htmlFor="auth-legal-consent"
    className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-muted"
  >
    <input
      id="auth-legal-consent"
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="mt-0.5 size-4 shrink-0 cursor-pointer accent-gold"
    />
    <span>
      {copy.auth.legalAgreeBefore}
      <a
        href={LEGAL_URLS.terms}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        onClick={(e) => e.stopPropagation()}
      >
        {copy.auth.legalTerms}
      </a>
      {copy.auth.legalAgreeMid}
      <a
        href={LEGAL_URLS.privacy}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        onClick={(e) => e.stopPropagation()}
      >
        {copy.auth.legalPrivacy}
      </a>
    </span>
  </label>
);

export default AuthLegalConsent;
