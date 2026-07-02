// KAN-38 item 3: client-side avatar normalisation.
// Pick → decode → max-edge 512px → WebP@0.85. If WebP encode yields null
// (rare; some browsers/inputs), fall back to the original File with its native
// MIME so the upload still succeeds (which is why the avatars bucket keeps
// png/jpeg allowed alongside webp).

export type NormalisedImage = {
  blob: Blob;
  contentType: string;
};

const MAX_EDGE = 512;
const WEBP_QUALITY = 0.85;
const ACCEPTED_INPUT = ["image/webp", "image/png", "image/jpeg"] as const;

export const isAcceptedImage = (file: File): boolean =>
  (ACCEPTED_INPUT as readonly string[]).includes(file.type);

/**
 * Resize to a max edge of 512px and re-encode to WebP.
 * Client-only (needs document/canvas). Throws if called server-side or if the
 * file is not a decodable image.
 */
export const normaliseAvatar = async (file: File): Promise<NormalisedImage> => {
  if (typeof document === "undefined") {
    throw new Error("normaliseAvatar must run in the browser");
  }
  if (!isAcceptedImage(file)) {
    throw new Error("Unsupported image type");
  }

  const bitmap = await loadBitmap(file);
  const { width, height } = scaledDimensions(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return { blob: file, contentType: file.type };
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webp = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  if (webp) {
    return { blob: webp, contentType: "image/webp" };
  }

  return { blob: file, contentType: file.type };
};

const loadBitmap = async (file: File): Promise<ImageBitmap> =>
  createImageBitmap(file);

const scaledDimensions = (
  w: number,
  h: number
): { width: number; height: number } => {
  const longest = Math.max(w, h);
  if (longest <= MAX_EDGE) return { width: w, height: h };
  const ratio = MAX_EDGE / longest;
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
