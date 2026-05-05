type Props = {
  filled: number;
  capacity: number;
};

export default function Dots({ filled, capacity }: Props) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: capacity }).map((_, i) => {
        const isFilled = i < filled;
        return (
          <span
            key={i}
            className="block h-2 w-2 rounded-full"
            style={{
              backgroundColor: isFilled ? "var(--terracotta)" : "transparent",
              border: isFilled
                ? "1px solid var(--terracotta)"
                : "1px solid var(--border-soft)",
            }}
          />
        );
      })}
    </div>
  );
}
