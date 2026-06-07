import { LabelHTMLAttributes, ReactNode } from "react";

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

const FieldLabel = ({
  children,
  className = "",
  ...props
}: FieldLabelProps) => (
  <label
    className={`block text-[11px] font-medium uppercase tracking-[0.18em] text-muted ${className}`}
    {...props}
  >
    {children}
  </label>
);

export default FieldLabel;
