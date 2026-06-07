type AvatarProps = {
  size?: number;
  initial?: string;
  photoUrl?: string | null;
  className?: string;
};

const Avatar = ({
  size = 36,
  initial = "A",
  photoUrl,
  className = "",
}: AvatarProps) => (
  <span
    className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--gold-10)] font-serif text-gold shadow-[0_0_0_3px_var(--gold-15)] ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.42 }}
  >
    {photoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
    ) : (
      initial.charAt(0).toUpperCase()
    )}
  </span>
);

export default Avatar;
