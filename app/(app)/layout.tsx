import AppTabLayout from "@/components/nav/AppTabLayout";
import type { ReactNode } from "react";

type AppGroupLayoutProps = {
  children: ReactNode;
};

const AppGroupLayout = ({ children }: AppGroupLayoutProps) => (
  <AppTabLayout>{children}</AppTabLayout>
);

export default AppGroupLayout;
