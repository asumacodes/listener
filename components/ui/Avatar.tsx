"use client";

import { useState } from "react";

type AvatarProps = {
  size?: number;
  initial?: string;
  photoUrl?: string | null;
  className?: string;
};

const Avatar = ({
  size = 36,
  initial = "?",
  photoUrl,
  className = "",
}: AvatarProps) => {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null);
  const letter = initial.trim().charAt(0).toUpperCase() || "?";
  const showPhoto = Boolean(photoUrl) && photoUrl !== failedPhotoUrl;

  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-gold/30 bg-gold-10 font-serif text-gold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl!}
          alt=""
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailedPhotoUrl(photoUrl ?? null)}
        />
      ) : (
        letter
      )}
    </span>
  );
};

export default Avatar;
