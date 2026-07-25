"use client";

import { useEffect, useRef } from "react";

type AuthTurnstileProps = {
  onToken: (token: string | null) => void;
  resetKey?: number;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Renders Cloudflare Turnstile when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 * Returns null when CAPTCHA is not configured yet (dev before dashboard CAPTCHA).
 */
const AuthTurnstile = ({ onToken, resetKey = 0 }: AuthTurnstileProps) => {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    const mount = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      containerRef.current.innerHTML = "";
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT}"]`
    );

    if (window.turnstile) {
      mount();
    } else if (existing) {
      existing.addEventListener("load", mount);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", mount);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    } else {
      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.onload = mount;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, resetKey]);

  if (!siteKey) return null;

  return (
    <div
      ref={containerRef}
      className="flex justify-center"
      data-testid="auth-turnstile"
    />
  );
};

export default AuthTurnstile;
