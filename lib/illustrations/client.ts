export const loadLottieAnimation = async (
  source: string,
  signal?: AbortSignal
): Promise<object> => {
  const response = await fetch(source, { signal });
  if (!response.ok) {
    throw new Error(`lottie_load_failed:${response.status}`);
  }
  return (await response.json()) as object;
};
