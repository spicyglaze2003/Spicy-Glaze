export default function MeshGradient({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 animate-gradient ${className}`}
      style={{
        background:
          "linear-gradient(135deg, var(--color-cream) 0%, var(--color-peach) 25%, var(--color-cream) 50%, var(--color-beige) 75%, var(--color-cream) 100%)",
        backgroundSize: "400% 400%",
      }}
      aria-hidden="true"
    />
  );
}
