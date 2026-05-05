type Props = {
  name: string;
};

export default function Toast({ name }: Props) {
  return (
    <div
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className="rounded-sharp border px-5 py-4 text-center shadow-lg"
        style={{
          backgroundColor: "var(--cream)",
          borderColor: "var(--ink)",
          color: "var(--ink)",
          maxWidth: "26rem",
        }}
      >
        <p className="font-serif italic text-lg">Dankjewel, {name}.</p>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Je boeking is bevestigd.
        </p>
      </div>
    </div>
  );
}
