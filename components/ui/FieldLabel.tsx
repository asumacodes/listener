import { LabelHTMLAttributes, ReactNode } from "react";

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

const FieldLabel = ({
  children,
  className = "",
  ...props
}: FieldLabelProps) => (
  <label className={`type-eyebrow block ${className}`} {...props}>
    {children}
  </label>
);

export default FieldLabel;
