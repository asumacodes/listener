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

type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

const formatEmailLocalPart = (email: string) => {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getUserDisplayName = (
  user: SessionUser | null,
  email: string | null
) => {
  const fromMeta = user?.user_metadata?.full_name ?? user?.user_metadata?.name;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  if (email?.trim()) return formatEmailLocalPart(email.trim());
  return null;
};

export const getUserInitial = (nameOrEmail: string | null | undefined) => {
  const source = nameOrEmail?.trim();
  if (!source) return "?";
  return source.charAt(0).toUpperCase();
};
