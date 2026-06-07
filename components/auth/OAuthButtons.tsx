import { GitHubIcon, GoogleIcon } from "@/components/auth/ProviderIcons";
import Button from "@/components/ui/Button";
import type { OAuthProvider } from "@/types";

type OAuthButtonsProps = {
  onOAuth: (provider: OAuthProvider) => void;
};

const OAuthButtons = ({ onOAuth }: OAuthButtonsProps) => (
  <div className="space-y-3">
    <Button
      variant="secondary"
      fullWidth
      onClick={() => onOAuth("google")}
      className="gap-2.5 rounded-xl bg-surface"
    >
      <GoogleIcon />
      Continue with Google
    </Button>
    <Button
      variant="secondary"
      fullWidth
      onClick={() => onOAuth("github")}
      className="gap-2.5 rounded-xl bg-surface"
    >
      <GitHubIcon />
      Continue with GitHub
    </Button>
  </div>
);

export default OAuthButtons;
