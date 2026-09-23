"use client";

import {
  useProfileContext,
  useProfileLoadedContext,
  useRefreshProfile as useRefreshProfileContext,
} from "@/components/profile/ProfileProvider";

/** Shared profile from ProfileProvider — no per-component fetch. */
export const useProfile = () => useProfileContext();

export const useRefreshProfile = () => useRefreshProfileContext();

/** False until the first profile read settles — gate fallback copy on this. */
export const useProfileLoaded = () => useProfileLoadedContext();
