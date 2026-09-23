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
  /**
   * The first read has settled (success or failure). Until then `profile` is
   * null because it's unknown, not because it's missing — render a skeleton,
   * never fallback copy like "Signed in with phone".
   */
  loaded: boolean;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loaded: false,
  refreshProfile: async () => {},
});

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refreshProfile = useCallback(async () => {
    invalidateUserProfile();
    const data = await fetchUserProfile();
    setProfile(data);
  }, []);

  useEffect(() => {
    let active = true;
    fetchUserProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        // Failed read: profile stays null, but it's no longer "loading".
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loaded, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

/** Read-only profile value. Unchanged signature for existing consumers. */
export const useProfileContext = (): UserProfile | null =>
  useContext(ProfileContext).profile;

/** True once the first profile read has settled (data or failure). */
export const useProfileLoadedContext = (): boolean =>
  useContext(ProfileContext).loaded;

/** Refresh trigger for the profile save flow (Piece C/D). */
export const useRefreshProfile = (): (() => Promise<void>) =>
  useContext(ProfileContext).refreshProfile;
