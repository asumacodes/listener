import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import type { AuthMode } from "@/types";
import type { Dispatch, FormEvent, SetStateAction } from "react";

type EmailPasswordFormProps = {
  mode: AuthMode;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
};

const EmailPasswordForm = ({
  mode,
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
}: EmailPasswordFormProps) => {
  const isSignIn = mode === "signin";
  const cta = isSignIn ? copy.auth.signIn.cta : copy.auth.signUp.cta;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder={copy.auth.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete={isSignIn ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isSignIn && (
          <p className="text-xs text-muted">{copy.auth.signUp.passwordHint}</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={isLoading}
        className="rounded-xl"
      >
        {isLoading ? "…" : cta}
      </Button>
    </form>
  );
};

export default EmailPasswordForm;
