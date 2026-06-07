import { IconChevron } from "@/components/icons/ListenerIcons";
import StatusBadge from "@/components/ui/Badge";
import Link from "next/link";

type ProjectCardProps = {
  href: string;
  name: string;
  line: string;
  dotColor: string;
  badge?: "attention" | "running" | null;
};

const ProjectCard = ({
  href,
  name,
  line,
  dotColor,
  badge,
}: ProjectCardProps) => (
  <Link
    href={href}
    className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-card transition active:scale-[0.995]"
  >
    <span
      className="h-7 w-7 shrink-0 rounded-full border border-black/[0.06]"
      style={{ backgroundColor: dotColor }}
      aria-hidden
    />
    <span className="min-w-0 flex-1 text-left">
      <span className="block font-serif text-xl leading-none text-text">
        {name}
      </span>
      <span className="mt-1 block text-[12.5px] text-text-secondary">
        {line}
      </span>
    </span>
    {badge === "attention" ? (
      <StatusBadge variant="needs-attention" showDot>
        Needs attention
      </StatusBadge>
    ) : null}
    {badge === "running" ? (
      <StatusBadge variant="mapping" showDot>
        Running
      </StatusBadge>
    ) : null}
    <IconChevron size={16} className="shrink-0 text-muted" />
  </Link>
);

export default ProjectCard;
