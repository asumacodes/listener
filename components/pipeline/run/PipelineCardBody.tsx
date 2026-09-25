import { ui } from "@/lib/design/ui";
import { isCompactFigure, splitMetricFigure } from "@/lib/ideas/metric-figure";
import type { PipelineCardContent, PrdSection } from "@/types/pipeline-ui";

type PipelineCardBodyProps = {
  content: PipelineCardContent;
};

type PrdItem = NonNullable<PrdSection["items"]>[number];

const MetricList = ({ items }: { items: PrdItem[] }) => (
  <ul className="mt-2 divide-y divide-border">
    {items.map((item) => {
      const { label, figure, detail } = splitMetricFigure(
        item.title,
        item.description
      );
      return (
        <li key={item.title} className="py-3.5">
          {label ? (
            <p className="mb-1.5 line-clamp-2 text-[12px] leading-snug text-text-secondary">
              {label}
            </p>
          ) : null}
          {isCompactFigure(figure) ? (
            <div className="flex items-baseline gap-3">
              <span className={`${ui.figureLg} shrink-0 whitespace-nowrap`}>
                {figure}
              </span>
              {detail ? (
                <span className="min-w-0 text-[14px] leading-snug text-text-secondary">
                  {detail}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="min-w-0">
              <p className="font-serif text-[19px] leading-snug text-text">
                {figure}
              </p>
              {detail ? (
                <p className="mt-1 text-[14px] leading-snug text-text-secondary">
                  {detail}
                </p>
              ) : null}
            </div>
          )}
        </li>
      );
    })}
  </ul>
);

const FeatureList = ({ items }: { items: PrdItem[] }) => (
  <ol className="mt-3 space-y-5">
    {items.map((item, i) => (
      <li key={item.title} className="flex gap-3">
        <span className="w-9 shrink-0 font-serif text-[26px] leading-none text-muted/50">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="text-[15px] leading-relaxed text-text">
            <span className="font-medium">{item.title}</span>
            {item.description ? (
              <span className="text-text-secondary"> — {item.description}</span>
            ) : null}
          </p>
          {item.rationale ? (
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {item.rationale}
            </p>
          ) : null}
        </div>
      </li>
    ))}
  </ol>
);

const BulletList = ({ items }: { items: PrdItem[] }) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item) => (
      <li key={item.title} className="flex gap-2">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
        <span className="text-sm leading-relaxed text-text">
          <span className="font-medium">{item.title}</span>
          {item.description ? (
            <span className="text-text-secondary"> — {item.description}</span>
          ) : null}
          {item.rationale ? (
            <span className="mt-0.5 block text-xs leading-relaxed text-muted">
              {item.rationale}
            </span>
          ) : null}
        </span>
      </li>
    ))}
  </ul>
);

/** One PRD section's content, keyed by the variant mapPrd sets. */
const PrdSectionContent = ({ section }: { section: PrdSection }) => {
  const items = section.items ?? [];
  switch (section.variant) {
    case "oneliner":
      // 22px (PrdPane's serif step below text-2xl) — sits above the text-xl card title.
      return (
        <p className="mt-2 font-serif text-[22px] leading-snug text-text">
          {section.body}
        </p>
      );
    case "metrics":
      return items.length ? <MetricList items={items} /> : null;
    case "features":
      return items.length ? <FeatureList items={items} /> : null;
    case undefined:
      return (
        <>
          {section.body ? (
            <p className={`mt-2 ${ui.bodyProse}`}>{section.body}</p>
          ) : null}
          {items.length ? <BulletList items={items} /> : null}
        </>
      );
    default: {
      const unhandled: never = section.variant;
      return unhandled;
    }
  }
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
        <div className="space-y-5">
          {content.noDirectCompetitors ? (
            <p className="text-sm leading-relaxed text-text-secondary">
              No direct competitors found in research
            </p>
          ) : null}
          {content.rows.map((row) => (
            <div key={row.name} className="border-l-2 border-gold-30 pl-3.5">
              <p className="font-serif text-lg leading-snug text-text">
                {row.name}
              </p>
              {row.positioning ? (
                <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                  {row.positioning}
                </p>
              ) : (
                <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                  {row.note}
                </p>
              )}
              {row.pricingModel ? (
                <p className="mt-1 text-xs text-muted">{row.pricingModel}</p>
              ) : null}
            </div>
          ))}
          {content.positioning?.length ? (
            <div className="space-y-3 pt-1">
              <p className={ui.sectionLabel}>Positioning vs. competitors</p>
              {content.positioning.map((p) => (
                <div
                  key={p.competitor}
                  className="border-l-2 border-gold-30 pl-3.5"
                >
                  <p className="font-serif text-lg leading-snug text-text">
                    {p.competitor}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
                    {p.delta}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    case "prd":
      return (
        <div className="space-y-6">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <p className={ui.sectionLabel}>{section.heading}</p>
              <PrdSectionContent section={section} />
            </div>
          ))}
        </div>
      );
    case "brand":
      return (
        <div className="space-y-5">
          {content.brand.direction ? (
            <p className={ui.bodyProse}>{content.brand.direction}</p>
          ) : null}
          {content.brand.palette.length ? (
            <div className="flex flex-wrap gap-2">
              {content.brand.palette.map((color) => (
                <span
                  key={color}
                  className="h-[22px] w-[22px] rounded-full border border-black/5"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          ) : null}
          {content.brand.values?.length ? (
            <p className="text-xs text-muted">
              <span className="uppercase tracking-wide">Values</span>{" "}
              {content.brand.values.join(" · ")}
            </p>
          ) : null}
          {content.brand.type ? (
            <p className="text-xs text-muted">
              <span className="uppercase tracking-wide">Type</span>{" "}
              {content.brand.type}
            </p>
          ) : null}
        </div>
      );
    case "engineering":
      return (
        <div className="space-y-6">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <p className={ui.sectionLabel}>{section.heading}</p>
              <p className={`mt-2 ${ui.bodyProse}`}>{section.body}</p>
            </div>
          ))}
        </div>
      );
    case "roadmap":
      return (
        <div className="space-y-5">
          {content.phases.map((phase) => (
            <div key={phase.phase} className="flex gap-3">
              <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
              <div>
                <p className="font-serif text-lg text-text">
                  {phase.phase}{" "}
                  <span className="font-sans text-sm text-muted">
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
