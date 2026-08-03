import DesktopShell from "@/components/desktop/DesktopShell";
import type { ReactNode } from "react";

type DesktopWorkspaceLayoutProps = {
  children: ReactNode;
};

const DesktopWorkspaceLayout = ({ children }: DesktopWorkspaceLayoutProps) => (
  <DesktopShell>{children}</DesktopShell>
);

export default DesktopWorkspaceLayout;
