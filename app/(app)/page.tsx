import ListenerApp from "@/components/ListenerApp";
import { appShellClass } from "@/lib/layout/shell";

const HomePage = () => (
  <main className={`${appShellClass} min-h-[calc(100dvh-4.5rem)]`}>
    <ListenerApp />
  </main>
);

export default HomePage;
