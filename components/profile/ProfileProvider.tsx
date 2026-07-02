"use client";

import { fetchUserProfile, invalidateUserProfile } from "@/lib/profile/client";
import type { UserProfile } from "@/types/profile";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ProfileContextValue = {
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  refreshProfile: async () => {},
});

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = useCallback(async () => {
    invalidateUserProfile();
    const data = await fetchUserProfile();
    setProfile(data);
  }, []);

  useEffect(() => {
    let active = true;
    void fetchUserProfile().then((data) => {
      if (active) setProfile(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

/** Read-only profile value. Unchanged signature for existing consumers. */
export const useProfileContext = (): UserProfile | null =>
  useContext(ProfileContext).profile;

/** Refresh trigger for the profile save flow (Piece C/D). */
export const useRefreshProfile = (): (() => Promise<void>) =>
  useContext(ProfileContext).refreshProfile;
