import ShellHeaderGrid from "@/components/layout/ShellHeaderGrid";
import { ui } from "@/lib/design/ui";

/** Mockup `.l-topbar.bare` — centered wordmark only on capture flow screens. */
const FlowWordmarkHeader = () => (
  <ShellHeaderGrid
    center={<div className={ui.shellWordmarkFlow}>Listener</div>}
  />
);

export default FlowWordmarkHeader;
