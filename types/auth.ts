import type { AuthMode, OAuthProvider } from "@/types";
import type { Dispatch, FormEvent, SetStateAction } from "react";

export type AuthState = {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  mode: AuthMode;
  setMode: Dispatch<SetStateAction<AuthMode>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isResending: boolean;
  setIsResending: Dispatch<SetStateAction<boolean>>;
  showCheckEmail: boolean;
  setShowCheckEmail: Dispatch<SetStateAction<boolean>>;
  oauthRedirect: OAuthProvider | null;
  setOauthRedirect: Dispatch<SetStateAction<OAuthProvider | null>>;
  emailBanner: string | null;
  setEmailBanner: Dispatch<SetStateAction<string | null>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
};

export type AuthActions = {
  switchMode: (next: AuthMode) => void;
  backFromCheckEmail: () => void;
  handleEmailSubmit: (e: FormEvent) => Promise<void>;
  handleResend: () => Promise<void>;
  handleOAuth: (provider: OAuthProvider) => Promise<void>;
};
