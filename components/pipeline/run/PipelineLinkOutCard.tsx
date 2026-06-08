import { IconArrowRight } from "@/components/icons/ListenerIcons";
import { ui } from "@/lib/design/ui";
import type { LinkOutContent } from "@/types/pipeline-ui";

type PipelineLinkOutCardProps = {
  title: string;
  link: LinkOutContent;
};

const PipelineLinkOutCard = ({ title, link }: PipelineLinkOutCardProps) => (
  <div className={`${ui.card} px-5 py-4`}>
    <div className="flex items-start justify-between gap-3">
      <h3 className="font-serif text-lg text-text">{title}</h3>
      <span className="shrink-0 rounded-full bg-gold-10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-deep">
        Link
      </span>
    </div>
    <p className="mt-2 text-sm text-text-secondary">{link.meta}</p>
    {link.href ? (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"
      >
        {link.cta}
        <IconArrowRight size={14} className="shrink-0" />
      </a>
    ) : (
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
        {link.cta}
        <IconArrowRight size={14} className="shrink-0" />
      </span>
    )}
  </div>
);

export default PipelineLinkOutCard;
