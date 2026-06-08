"use client";

import ShellHeaderGrid from "@/components/layout/ShellHeaderGrid";
import Avatar from "@/components/ui/Avatar";
import { IconSearch } from "@/components/icons/ListenerIcons";
import IconButton from "@/components/ui/IconButton";
import { ui } from "@/lib/design/ui";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";

type CaptureHeaderProps = {
  onSearch?: () => void;
};

const CaptureHeader = ({ onSearch }: CaptureHeaderProps) => {
  const profile = useProfile();
  const avatarInitial = profile?.displayName ?? profile?.email ?? "?";

  const searchControl = onSearch ? (
    <IconButton aria-label="Search" onClick={onSearch}>
      <IconSearch size={20} />
    </IconButton>
  ) : (
    <Link
      href="/search"
      className="flex h-11 w-11 items-center justify-center text-text-secondary"
    >
      <IconSearch size={20} />
    </Link>
  );

  return (
    <ShellHeaderGrid
      left={searchControl}
      center={<div className={ui.shellWordmarkCapture}>Listener</div>}
      right={
        <Link href="/account" className="justify-self-end" aria-label="Account">
          <Avatar
            size={36}
            initial={avatarInitial}
            photoUrl={profile?.avatarUrl}
          />
        </Link>
      }
    />
  );
};

export default CaptureHeader;
