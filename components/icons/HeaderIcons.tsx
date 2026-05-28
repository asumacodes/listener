type IconProps = { className?: string };

const iconClass = (className?: string) =>
  ["h-4 w-4 shrink-0", className].filter(Boolean).join(" ");

export const FolderIcon = ({ className }: IconProps) => (
  <svg
    className={iconClass(className)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    aria-hidden
  >
    <path
      d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.2l1.3 1.5H12.5A1.5 1.5 0 0 1 14 6v5.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z"
      strokeLinejoin="round"
    />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg
    className={className ?? "h-5 w-5 shrink-0"}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <circle cx="9" cy="9" r="5.25" />
    <path d="M13.25 13.25 17 17" strokeLinecap="round" />
  </svg>
);

export const LogOutIcon = ({ className }: IconProps) => (
  <svg
    className={iconClass(className)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    aria-hidden
  >
    <path d="M6 2.5H4.5A1.5 1.5 0 0 0 3 4v8a1.5 1.5 0 0 0 1.5 1.5H6" />
    <path d="M10.5 8H6M10.5 8 8.5 6M10.5 8 8.5 10" strokeLinecap="round" />
    <path d="M13 3.5v9" strokeLinecap="round" />
  </svg>
);
