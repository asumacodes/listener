"use client";

import {
  useProfileContext,
  useRefreshProfile as useRefreshProfileContext,
} from "@/components/profile/ProfileProvider";

/** Shared profile from ProfileProvider — no per-component fetch. */
export const useProfile = () => useProfileContext();

export const useRefreshProfile = () => useRefreshProfileContext();
