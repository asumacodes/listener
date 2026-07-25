"use client";

import AuthTurnstile from "@/components/auth/AuthTurnstile";
import CountrySelect from "@/components/auth/CountrySelect";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
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
            className="mt-1.5 tracking-[0.3em]"
            aria-describedby="auth-otp-hint"
          />
          <p
            id="auth-otp-hint"
            className="mt-2 text-[13px] leading-relaxed text-text-secondary"
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
        <div className="flex items-center justify-between text-[13px]">
          <button
            type="button"
            disabled={isSendingOtp}
            onClick={() => {
              void (async () => {
                await onSend();
                setTurnstileResetKey((k) => k + 1);
              })();
            }}
            className="font-medium text-gold hover:brightness-110 disabled:opacity-50"
          >
            {isSendingOtp ? copy.auth.phone.sending : copy.auth.phone.resend}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-text-secondary hover:text-text"
          >
            {copy.auth.phone.back}
          </button>
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
          <CountrySelect
            value={countryCode}
            onChange={onCountryCodeChange}
            ariaLabel={copy.auth.phone.countryAria}
          />
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
