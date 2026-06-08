import type { PipelineCardContent } from "@/types/pipeline-ui";

type PipelineCardBodyProps = {
  content: PipelineCardContent;
};

const PipelineCardBody = ({ content }: PipelineCardBodyProps) => {
  switch (content.id) {
    case "transcript":
      return (
        <p className="text-base leading-[1.65] text-pretty text-text">
          {content.text}
        </p>
      );
    case "competitor":
      return (
        <div className="space-y-4">
          {content.rows.map((row) => (
            <div key={row.name} className="border-l-2 border-gold-30 pl-3.5">
              <p className="text-sm font-semibold text-text">{row.name}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                {row.note}
              </p>
            </div>
          ))}
        </div>
      );
    case "prd":
      return (
        <div className="space-y-3.5">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                {section.heading}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      );
    case "brand":
      return (
        <div className="space-y-3.5">
          <p className="text-sm leading-relaxed text-text">
            {content.brand.direction}
          </p>
          <div className="flex flex-wrap gap-2">
            {content.brand.palette.map((color) => (
              <span
                key={color}
                className="h-[22px] w-[22px] rounded-full border border-black/5"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs text-muted">
            <span className="uppercase tracking-wide">Type</span>{" "}
            {content.brand.type}
          </p>
        </div>
      );
    case "engineering":
      return (
        <div className="space-y-3.5">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                {section.heading}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      );
    case "roadmap":
      return (
        <div className="space-y-3.5">
          {content.phases.map((phase) => (
            <div key={phase.phase} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <div>
                <p className="text-sm font-semibold text-text">
                  {phase.phase}{" "}
                  <span className="font-normal text-muted">
                    · {phase.weeks}
                  </span>
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                  {phase.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default PipelineCardBody;
