import type { OAuthProvider } from "@/types";
import type { Dispatch, SetStateAction } from "react";

export type AuthState = {
  oauthRedirect: OAuthProvider | null;
  setOauthRedirect: Dispatch<SetStateAction<OAuthProvider | null>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
};

export type AuthActions = {
  handleOAuth: (provider: OAuthProvider) => Promise<void>;
};
