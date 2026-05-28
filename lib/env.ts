/**
 * Required public env vars. Throws at call time if missing (server or client).
 * Prefer calling from server routes / lib entry points, not at module top-level.
 */
export const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const getSupabasePublicEnv = () => ({
  url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});

export const getWhisperEndpoint = () =>
  requireEnv("NEXT_PUBLIC_WHISPER_ENDPOINT");
