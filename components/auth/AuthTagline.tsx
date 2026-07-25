import { ui } from "@/lib/design/ui";
import { copy } from "@/lib/design/copy";

/** Tagline — pinned to the bottom of the auth screen. */
const AuthTagline = () => (
  <p className={`${ui.eyebrow} text-center`}>{copy.auth.tagline}</p>
);

export default AuthTagline;
