import { createClient } from "@/lib/supabase/client";

export const getSessionUser = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
};

export const getUserInitial = (email: string | null | undefined) => {
  const source = email?.trim();
  if (!source) return "?";
  return source.charAt(0).toUpperCase();
};
