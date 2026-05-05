"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onClose: () => void;
  onUnlock: (code: string) => void;
};

export default function AdminModal({ onClose, onUnlock }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const expected = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "robin0427";
    if (code === expected) {
      onUnlock(code);
    } else {
      setError("Code klopt niet.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--ink)]/30"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm border border-[var(--border-soft)] bg-[var(--cream)] p-6 shadow-xl"
        style={{ borderRadius: "2px" }}
      >
        <h2
          id="admin-modal-title"
          className="font-serif text-xl text-[var(--ink)]"
        >
          Beheer
        </h2>
        <p className="mt-1 text-sm italic text-[var(--ink-faint)]">
          Voer de code in om alle boekingen te beheren.
        </p>

        <label className="mt-4 block">
          <span className="text-sm text-[var(--ink-soft)]">Code</span>
          <input
            ref={inputRef}
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full border border-[var(--border-soft)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            style={{ borderRadius: "2px" }}
          />
        </label>

        {error ? (
          <p className="mt-3 text-sm italic text-[var(--terracotta)]">{error}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-transparent px-4 py-2 text-sm italic text-[var(--ink-soft)] hover:underline"
            style={{ borderRadius: "2px" }}
          >
            Annuleer
          </button>
          <button
            type="submit"
            className="border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--cream)] hover:text-[var(--ink)]"
            style={{ borderRadius: "2px" }}
          >
            Ontgrendel
          </button>
        </div>
      </form>
    </div>
  );
}
