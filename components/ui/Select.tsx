import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

const Select = ({
  className = "",
  hasError = false,
  ...props
}: SelectProps) => (
  <select
    className={`w-full rounded-xl border px-3.5 py-3.5 font-sans text-[15px] text-text outline-none transition focus:border-gold focus:shadow-[0_0_0_2px_var(--gold-30)] disabled:opacity-50 border-border bg-surface ${
      hasError ? "border-red" : ""
    } ${className}`}
    {...props}
  />
);

export default Select;
