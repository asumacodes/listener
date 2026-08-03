"use client";

import AuthTurnstile from "@/components/auth/AuthTurnstile";
import CountrySelect from "@/components/auth/CountrySelect";
import OtpInput from "@/components/auth/OtpInput";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { useEffect, useState } from "react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_S = 30;

type PhoneOtpFormProps = {
  countryCode: string;
  nationalNumber: string;
  otp: string;
  otpSent: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  /** When false on the methods view, Send is disabled until legal consent. */
  legalAccepted?: boolean;
  onCountryCodeChange: (value: string) => void;
  onNationalNumberChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onCaptchaToken: (token: string | null) => void;
  onSend: () => void | Promise<void>;
  onVerify: (otpOverride?: string) => void | Promise<void>;
  onBack: () => void;
  /** Optional larger digit boxes (desktop OTP). */
  digitBoxClassName?: string;
};

const PhoneOtpForm = ({
  countryCode,
  nationalNumber,
  otp,
  otpSent,
  isSendingOtp,
  isVerifyingOtp,
  legalAccepted = true,
  onCountryCodeChange,
  onNationalNumberChange,
  onOtpChange,
  onCaptchaToken,
  onSend,
  onVerify,
  onBack,
  digitBoxClassName,
}: PhoneOtpFormProps) => {
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(
      () => setResendCooldown((s) => s - 1),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (next: string) => {
    onOtpChange(next);
    // Auto-submit on the final digit; pass the fresh value since `otp`
    // state won't have re-rendered into the verify action yet.
    if (next.length === OTP_LENGTH && !isVerifyingOtp) {
      void onVerify(next);
    }
  };

  if (otpSent) {
    return (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onVerify();
        }}
      >
        <OtpInput
          id="auth-otp"
          value={otp}
          ariaLabel={copy.auth.phone.otpLabel}
          disabled={isVerifyingOtp}
          length={OTP_LENGTH}
          onChange={handleOtpChange}
          boxClassName={digitBoxClassName}
        />
        <Button
          type="submit"
          fullWidth
          disabled={isVerifyingOtp || otp.length < OTP_LENGTH}
        >
          {isVerifyingOtp ? copy.auth.phone.verifying : copy.auth.phone.verify}
        </Button>
        <AuthTurnstile resetKey={turnstileResetKey} onToken={onCaptchaToken} />
        <div className="flex items-center justify-between text-[13px]">
          <button
            type="button"
            disabled={isSendingOtp || resendCooldown > 0}
            onClick={() => {
              void (async () => {
                await onSend();
                setTurnstileResetKey((k) => k + 1);
                setResendCooldown(RESEND_COOLDOWN_S);
              })();
            }}
            className="font-medium text-gold hover:brightness-110 disabled:opacity-50"
          >
            {isSendingOtp
              ? copy.auth.phone.sending
              : resendCooldown > 0
                ? copy.auth.phone.resendIn(resendCooldown)
                : copy.auth.phone.resend}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-muted transition hover:text-text"
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
        void (async () => {
          await onSend();
          setResendCooldown(RESEND_COOLDOWN_S);
        })();
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
        disabled={isSendingOtp || !nationalNumber.trim() || !legalAccepted}
      >
        {isSendingOtp ? copy.auth.phone.sending : copy.auth.phone.send}
      </Button>
    </form>
  );
};

export default PhoneOtpForm;
