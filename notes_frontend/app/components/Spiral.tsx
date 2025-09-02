/**
 * PUBLIC_INTERFACE
 * Renders a row of C-shaped ring SVGs to simulate a spiral binding.
 */
export function Spiral({ count = 12 }: { count?: number }) {
  return (
    <div
      className="header-spiral"
      aria-hidden="true"
      role="presentation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.25))",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="22" height="32" viewBox="0 0 22 32">
          <path
            d="M6 4 C 2 12, 2 20, 6 28"
            stroke="var(--ring-metal)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M16 4 C 20 12, 20 20, 16 28"
            stroke="var(--ring-metal)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}
