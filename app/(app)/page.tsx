import ListenerApp from "@/components/ListenerApp";

const Home = () => (
  <main className="mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-[390px] flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))]">
    <ListenerApp />
  </main>
);

export default Home;
