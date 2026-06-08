const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const startOfLocalDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** UTC calendar parts — identical output in Node SSR and the browser. */
export const formatShortDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

/** Idea cards — today: relative hrs/min, yesterday, else date with year. */
export const formatIdeaTime = (iso: string, now = new Date()): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const today = startOfLocalDay(now);
  const target = startOfLocalDay(d);
  const dayDiff = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (dayDiff === 0) {
    const diffMs = Math.max(0, now.getTime() - d.getTime());
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) {
      const mins = Math.max(1, Math.floor(diffMs / 60_000));
      return `${mins} min ago`;
    }
    return `${hours} hr ago`;
  }

  if (dayDiff === 1) return "yesterday";

  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/** Recording strip timestamp — mockup `MON DD, HH:MM` in UTC. */
export const formatRecordedAt = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const month = MONTHS[d.getUTCMonth()].toUpperCase();
  const day = d.getUTCDate();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${month} ${day}, ${hours}:${minutes}`;
};
