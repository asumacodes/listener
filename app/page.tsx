import RenderScreen from "@/components/RenderScreen";

const Home = () => {
  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '480px', margin: '0 auto' }}>
      <h1>Listener</h1>
      <p style={{ color: '#999', fontSize: '0.8rem' }}>Speak. Transcribe. Ship.</p>

      <RenderScreen />
    </main>
  );
}

export default Home;