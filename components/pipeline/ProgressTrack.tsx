type ProgressTrackProps = {
  active?: boolean;
  shimmer?: boolean;
};

const ProgressTrack = ({
  active = true,
  shimmer = true,
}: ProgressTrackProps) => {
  if (!active) return null;

  return (
    <div
      className="relative mt-5 h-[3px] w-[78%] overflow-hidden rounded-sm bg-[#E8E3D7]"
      aria-hidden
    >
      {shimmer ? (
        <span className="ill-track-shimmer absolute inset-y-0 w-[38%] rounded-sm bg-gold" />
      ) : (
        <span className="absolute inset-y-0 w-[38%] rounded-sm bg-gold" />
      )}
    </div>
  );
};

export default ProgressTrack;
