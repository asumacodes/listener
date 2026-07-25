"use client";

import AuthTurnstile from "@/components/auth/AuthTurnstile";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { PHONE_COUNTRIES } from "@/lib/auth/phone";
import { copy } from "@/lib/design/copy";
import { useState } from "react";

type PhoneOtpFormProps = {
  countryCode: string;
  nationalNumber: string;
  phoneE164: string | null;
  otp: string;
  otpSent: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  onCountryCodeChange: (value: string) => void;
  onNationalNumberChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onCaptchaToken: (token: string | null) => void;
  onSend: () => void | Promise<void>;
  onVerify: () => void | Promise<void>;
  onBack: () => void;
};

const selectClassName =
  "shrink-0 rounded-xl border border-border bg-surface px-2.5 py-3.5 font-sans text-[15px] text-text outline-none transition focus:border-gold focus:shadow-[0_0_0_2px_var(--gold-30)] disabled:opacity-50";

const PhoneOtpForm = ({
  countryCode,
  nationalNumber,
  phoneE164,
  otp,
  otpSent,
  isSendingOtp,
  isVerifyingOtp,
  onCountryCodeChange,
  onNationalNumberChange,
  onOtpChange,
  onCaptchaToken,
  onSend,
  onVerify,
  onBack,
}: PhoneOtpFormProps) => {
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  if (otpSent) {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onVerify();
        }}
      >
        <div>
          <FieldLabel htmlFor="auth-otp">{copy.auth.phone.otpLabel}</FieldLabel>
          <Input
            id="auth-otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder={copy.auth.phone.otpPlaceholder}
            value={otp}
            onChange={(e) =>
              onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mt-1.5 tracking-[0.2em]"
            aria-describedby="auth-otp-hint"
          />
          <p
            id="auth-otp-hint"
            className="mt-2 text-xs leading-relaxed text-text-secondary"
          >
            {copy.auth.phone.otpHint(phoneE164 ?? "")}
          </p>
        </div>
        <Button
          type="submit"
          fullWidth
          disabled={isVerifyingOtp || otp.length < 6}
        >
          {isVerifyingOtp ? copy.auth.phone.verifying : copy.auth.phone.verify}
        </Button>
        <AuthTurnstile resetKey={turnstileResetKey} onToken={onCaptchaToken} />
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            disabled={isSendingOtp}
            onClick={() => {
              void (async () => {
                await onSend();
                setTurnstileResetKey((k) => k + 1);
              })();
            }}
          >
            {isSendingOtp ? copy.auth.phone.sending : copy.auth.phone.resend}
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={onBack}>
            {copy.auth.phone.back}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void onSend();
      }}
    >
      <div>
        <FieldLabel htmlFor="auth-national">{copy.auth.phone.label}</FieldLabel>
        <div className="mt-1.5 flex gap-2">
          <select
            id="auth-country"
            name="country"
            aria-label={copy.auth.phone.countryAria}
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className={selectClassName}
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                +{c.dial} {c.code}
              </option>
            ))}
          </select>
          <Input
            id="auth-national"
            name="nationalNumber"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder={copy.auth.phone.placeholder}
            value={nationalNumber}
            onChange={(e) =>
              onNationalNumberChange(e.target.value.replace(/[^\d\s]/g, ""))
            }
            className="min-w-0 flex-1"
          />
        </div>
      </div>
      <AuthTurnstile resetKey={turnstileResetKey} onToken={onCaptchaToken} />
      <Button
        type="submit"
        fullWidth
        disabled={isSendingOtp || !nationalNumber.trim()}
      >
        {isSendingOtp ? copy.auth.phone.sending : copy.auth.phone.send}
      </Button>
    </form>
  );
};

export default PhoneOtpForm;
