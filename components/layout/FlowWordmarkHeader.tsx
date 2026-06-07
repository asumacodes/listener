/** Mockup `.l-topbar.bare` — centered wordmark only on capture flow screens. */
const FlowWordmarkHeader = () => (
  <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 py-4">
    <span aria-hidden />
    <div className="text-center font-serif text-2xl leading-none tracking-[-0.01em] text-gold">
      Listener
    </div>
    <span aria-hidden />
  </header>
);

export default FlowWordmarkHeader;
