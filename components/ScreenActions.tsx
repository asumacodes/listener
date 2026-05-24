import Button from "@/components/ui/Button";

type ScreenActionsProps = {
  leftLabel: string;
  rightLabel: string;
  onLeft: () => void;
  onRight: () => void;
  rightDisabled?: boolean;
  leftDisabled?: boolean;
};

const ScreenActions = ({
  leftLabel,
  rightLabel,
  onLeft,
  onRight,
  rightDisabled = false,
  leftDisabled = false,
}: ScreenActionsProps) => {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 pt-8">
      <Button variant="ghost" onClick={onLeft} disabled={leftDisabled}>
        {leftLabel}
      </Button>
      <Button variant="primary" onClick={onRight} disabled={rightDisabled}>
        {rightLabel}
        {rightLabel.includes("Confirm") && (
          <span aria-hidden="true">&nbsp;→</span>
        )}
      </Button>
    </div>
  );
};

export default ScreenActions;
