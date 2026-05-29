import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";

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
}: ScreenActionsProps) => (
  <CtaBar>
    <Button
      variant="secondary"
      fullWidth
      onClick={onLeft}
      disabled={leftDisabled}
    >
      {leftLabel}
    </Button>
    <Button
      variant="primary"
      fullWidth
      onClick={onRight}
      disabled={rightDisabled}
    >
      {rightLabel}
      {rightLabel.toLowerCase().includes("confirm") && (
        <span aria-hidden="true">→</span>
      )}
    </Button>
  </CtaBar>
);

export default ScreenActions;
