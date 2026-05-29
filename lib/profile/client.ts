import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/profile";

export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data } = await supabase
    .from("users")
    .select("display_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    displayName: data.display_name ?? data.email.split("@")[0],
    email: data.email,
    avatarUrl: data.avatar_url,
  };
};
