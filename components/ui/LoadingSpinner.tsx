const LoadingSpinner = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-spin-slow h-12 w-12 rounded-full border-[3px] border-gold-primary/20 border-t-gold-primary ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
