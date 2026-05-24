type AppHeaderProps = {
  showMaxTime?: boolean;
};

const AppHeader = ({ showMaxTime = false }: AppHeaderProps) => {
  return (
    <header className="relative flex items-center justify-center py-2">
      <h1 className="font-serif text-[28px] tracking-tight text-gold-brand">
        Listener
      </h1>
      {showMaxTime && (
        <span className="absolute right-0 text-xs tracking-wide text-text-muted">
          2:00 max
        </span>
      )}
    </header>
  );
};

export default AppHeader;
