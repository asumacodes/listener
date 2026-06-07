import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const s = (size?: number) => size ?? 22;

export const IconSearch = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden
    {...p}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconMic = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v4" />
  </svg>
);

export const IconGrid = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconUser = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const IconBack = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const IconChevron = ({ size, className = "", ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
    {...p}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconMore = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    {...p}
  >
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

export const IconShare = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <path d="M12 3v12" />
    <path d="m8 7 4-4 4 4" />
    <path d="M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7" />
  </svg>
);

export const IconBell = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.2 2 6H4c.5-.8 2-2 2-6z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IconCheck = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <path d="M4 12.5 9.5 18 20 6" />
  </svg>
);

export const IconPlay = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    {...p}
  >
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
  </svg>
);

export const IconPlus = ({ size, ...p }: IconProps) => (
  <svg
    width={s(size)}
    height={s(size)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
    {...p}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
