import Link from "next/link";
import type { ReactNode } from "react";

type IdeaCardProps = {
  href: string;
  title: string;
  summary?: ReactNode;
  time: string;
};

const IdeaCard = ({ href, title, summary, time }: IdeaCardProps) => (
  <Link
    href={href}
    className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface p-[18px] text-left shadow-card transition active:scale-[0.995]"
  >
    <h3 className="font-serif text-xl leading-tight text-text">{title}</h3>
    {summary ? (
      <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {summary}
      </p>
    ) : null}
    <p className="text-xs text-muted" suppressHydrationWarning>
      {time}
    </p>
  </Link>
);

export default IdeaCard;
