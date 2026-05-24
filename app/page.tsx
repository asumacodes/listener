import ListenerApp from "@/components/ListenerApp";

const Home = () => {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ListenerApp />
    </main>
  );
};

export default Home;
