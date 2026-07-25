"use client";

import AuthTurnstile from "@/components/auth/AuthTurnstile";
import Button from "@/components/ui/Button";
import FieldLabel from "@/components/ui/FieldLabel";
import Input from "@/components/ui/Input";
import { copy } from "@/lib/design/copy";
import { useState } from "react";

type PhoneOtpFormProps = {
  phone: string;
  otp: string;
  otpSent: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  onPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onCaptchaToken: (token: string | null) => void;
  onSend: () => void | Promise<void>;
  onVerify: () => void | Promise<void>;
  onBack: () => void;
};

const PhoneOtpForm = ({
  phone,
  otp,
  otpSent,
  isSendingOtp,
  isVerifyingOtp,
  onPhoneChange,
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
            {copy.auth.phone.otpHint(phone)}
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
        <FieldLabel htmlFor="auth-phone">{copy.auth.phone.label}</FieldLabel>
        <Input
          id="auth-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder={copy.auth.phone.placeholder}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <AuthTurnstile resetKey={turnstileResetKey} onToken={onCaptchaToken} />
      <Button type="submit" fullWidth disabled={isSendingOtp || !phone.trim()}>
        {isSendingOtp ? copy.auth.phone.sending : copy.auth.phone.send}
      </Button>
    </form>
  );
};

export default PhoneOtpForm;
