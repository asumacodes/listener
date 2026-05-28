// The fixed 6-colour project palette. Defined once, consumed everywhere:
// - the DB CHECK constraint (projects.color) mirrors these keys
// - the project picker UI
// - project chips/cards
// If you change a key here, update the CHECK constraint in a migration too.

export const PROJECT_COLORS = [
  { key: "gold", label: "Gold", hex: "#C9A96E" },
  { key: "sage", label: "Sage", hex: "#8FA88F" },
  { key: "rose", label: "Rose", hex: "#C99A9A" },
  { key: "sky", label: "Sky", hex: "#8FA8C9" },
  { key: "lavender", label: "Lavender", hex: "#A89AC9" },
  { key: "sand", label: "Sand", hex: "#C9B88F" },
] as const;

export type ProjectColor = (typeof PROJECT_COLORS)[number]["key"];

export const PROJECT_COLOR_KEYS = PROJECT_COLORS.map(
  (c) => c.key
) as ProjectColor[];

export const colorHex = (key: ProjectColor): string =>
  PROJECT_COLORS.find((c) => c.key === key)?.hex ?? "#C9B88F";

export const isProjectColor = (value: string): value is ProjectColor =>
  PROJECT_COLOR_KEYS.includes(value as ProjectColor);
