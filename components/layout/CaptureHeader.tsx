"use client";

import Avatar from "@/components/ui/Avatar";
import { IconSearch } from "@/components/icons/ListenerIcons";
import IconButton from "@/components/ui/IconButton";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";

type CaptureHeaderProps = {
  onSearch?: () => void;
};

const CaptureHeader = ({ onSearch }: CaptureHeaderProps) => {
  const profile = useProfile();
  const avatarInitial = profile?.displayName ?? profile?.email ?? "?";

  return (
    <header className="grid shrink-0 grid-cols-[44px_1fr_44px] items-center gap-2 py-3">
      {onSearch ? (
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
      )}
      <div className="text-center font-serif text-[30px] leading-none tracking-tight text-gold">
        Listener
      </div>
      <Link href="/account" className="justify-self-end" aria-label="Account">
        <Avatar
          size={36}
          initial={avatarInitial}
          photoUrl={profile?.avatarUrl}
        />
      </Link>
    </header>
  );
};

export default CaptureHeader;
