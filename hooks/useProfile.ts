"use client";

import { useProfileContext } from "@/components/profile/ProfileProvider";

/** Shared profile from ProfileProvider — no per-component fetch. */
export const useProfile = () => useProfileContext();
