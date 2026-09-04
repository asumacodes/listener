import { IconArrowRight } from "@/components/icons/ListenerIcons";
import Link from "next/link";
import type { ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
};

type AccountNavRowProps = BaseProps &
  ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

const ROW_CLASS =
  "flex w-full items-center justify-between px-4 py-3.5 text-left text-sm text-text transition hover:bg-black/[0.02]";

const AccountNavRow = ({
  href,
  onClick,
  children,
  className = "",
}: AccountNavRowProps) => {
  const inner = (
    <>
      {children}
      <IconArrowRight size={16} className="shrink-0 text-muted" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${ROW_CLASS} ${className}`}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${ROW_CLASS} ${className}`}
    >
      {inner}
    </button>
  );
};

export default AccountNavRow;
