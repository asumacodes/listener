import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  readOnlyStyle?: boolean;
};

const Input = ({
  className = "",
  hasError = false,
  readOnlyStyle = false,
  ...props
}: InputProps) => (
  <input
    className={`w-full rounded-xl border px-3.5 py-3.5 font-sans text-[15px] text-text outline-none transition placeholder:text-muted focus:border-gold focus:shadow-[0_0_0_2px_var(--gold-30)] disabled:opacity-50 ${
      readOnlyStyle
        ? "border-border bg-canvas text-muted"
        : "border-border bg-surface"
    } ${hasError ? "border-red" : ""} ${className}`}
    {...props}
  />
);

export default Input;
