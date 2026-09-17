"use client";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthIntro from "@/components/auth/AuthIntro";
import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/Button";
import { useCheckoutSuccessPoll } from "@/hooks";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { useRouter } from "next/navigation";

type CheckoutSuccessScreenProps = {
  /** Copy-only. Never treat as proof of entitlement. */
  intent: string | null;
};

const CheckoutSuccessScreen = ({ intent }: CheckoutSuccessScreenProps) => {
  useCheckoutSuccessPoll();
  const router = useRouter();
  const lead =
    intent === "upgrade"
      ? copy.checkout.successBodyUpgrade
      : copy.checkout.successBody;

  return (
    <AuthLayout>
      <div className="mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-sm flex-col justify-between">
        <AuthHeader />
        <div className="w-full">
          <p className={`mb-3 text-center ${ui.eyebrow}`}>
            {copy.checkout.successEyebrow}
          </p>
          <AuthIntro headline={copy.checkout.successTitle} lead={lead} />
          <Button fullWidth className="mt-8" onClick={() => router.push("/")}>
            {copy.checkout.successStudio}
          </Button>
        </div>
        <div />
      </div>
    </AuthLayout>
  );
};

export default CheckoutSuccessScreen;
