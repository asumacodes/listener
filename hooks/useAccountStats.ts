"use client";

import { fetchAccountStats } from "@/lib/account/stats";
import type { AccountStats } from "@/lib/account/stats";
import { useEffect, useState } from "react";

export const useAccountStats = () => {
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAccountStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : "Failed to load stats");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { stats, error };
};

export default useAccountStats;
