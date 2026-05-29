type IconProps = { className?: string };

const iconClass = (className?: string) =>
  ["h-4 w-4 shrink-0", className].filter(Boolean).join(" ");

export const PencilIcon = ({ className }: IconProps) => (
  <svg
    className={iconClass(className)}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M10.5 2.5a1.4 1.4 0 0 1 2 2L5.5 12 3 13l1-3.5Z" />
  </svg>
);
