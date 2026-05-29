"use client";

import { fetchUserProfile } from "@/lib/profile/client";
import type { UserProfile } from "@/types/profile";
import { useEffect, useState } from "react";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    fetchUserProfile().then((data) => {
      if (active && data) setProfile(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return profile;
};
