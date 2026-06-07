import { IconPlus } from "@/components/icons/ListenerIcons";

type DashedAddProps = {
  label: string;
  onClick?: () => void;
  href?: string;
};

const DashedAdd = ({ label, onClick }: DashedAddProps) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-0.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-dashed-add bg-transparent px-4 py-4 text-sm font-medium text-gold transition hover:border-[var(--gold-30)] hover:bg-[var(--gold-10)]"
  >
    <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[var(--gold-10)] text-base leading-none text-gold">
      <IconPlus size={14} />
    </span>
    {label}
  </button>
);

export default DashedAdd;
