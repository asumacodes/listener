"use client";

import ShellHeaderGrid from "@/components/layout/ShellHeaderGrid";
import Avatar from "@/components/ui/Avatar";
import { IconSearch } from "@/components/icons/ListenerIcons";
import { useProfile } from "@/hooks/useProfile";
import { ui } from "@/lib/design/ui";
import Link from "next/link";

const ProjectsShellHeader = () => {
  const profile = useProfile();
  const avatarInitial = profile?.displayName ?? profile?.email ?? "?";

  return (
    <ShellHeaderGrid
      left={
        <Link
          href="/search"
          className="flex h-11 w-11 items-center justify-center text-text-secondary transition hover:text-text"
          aria-label="Search"
        >
          <IconSearch size={20} />
        </Link>
      }
      center={<h1 className={ui.shellPageTitle}>Projects</h1>}
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

export default ProjectsShellHeader;
