type ExpiryBannerProps = {
  daysRemaining: number;
};

const ExpiryBanner = ({ daysRemaining }: ExpiryBannerProps) => {
  const dayLabel =
    daysRemaining <= 0
      ? "today"
      : daysRemaining === 1
        ? "in 1 day"
        : `in ${daysRemaining} days`;

  return (
    <div className="rounded-xl border border-gold-30 bg-gold-10 px-4 py-3 text-sm leading-relaxed text-text-secondary">
      These results expire {dayLabel} and will be removed.{" "}
      <span className="font-medium text-gold">
        Download anything you want to keep.
      </span>
    </div>
  );
};

export default ExpiryBanner;
