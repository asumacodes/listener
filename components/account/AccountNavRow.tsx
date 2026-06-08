import { IconChevron } from "@/components/icons/ListenerIcons";
import Link from "next/link";
import type { ReactNode } from "react";

type AccountNavRowProps = {
  href: string;
  children: ReactNode;
};

const AccountNavRow = ({ href, children }: AccountNavRowProps) => (
  <Link
    href={href}
    className="flex items-center justify-between px-4 py-3.5 text-sm text-text transition hover:bg-black/[0.02]"
  >
    {children}
    <IconChevron size={18} className="shrink-0 text-muted" />
  </Link>
);

export default AccountNavRow;
