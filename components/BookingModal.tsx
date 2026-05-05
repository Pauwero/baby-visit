"use client";

import { useEffect, useRef, useState } from "react";
import type { Slot } from "@/lib/slots";

type Props = {
  slot: Slot;
  remaining: number;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    guestCount: number;
    message: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export default function BookingModal({
  slot,
  remaining,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const maxGuests = Math.max(1, Math.min(8, remaining));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!name.trim()) {
      setError("Vul je naam in.");
      return;
    }
    setSubmitting(true);
    const result = await onSubmit({ name, guestCount, message });
    setSubmitting(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center px-4 py-6 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <button
        type="button"
        aria-label="Sluiten"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--ink)]/30"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md border border-[var(--border-soft)] bg-[var(--cream)] p-6 shadow-xl"
        style={{ borderRadius: "2px" }}
      >
        <h2
          id="booking-modal-title"
          className="font-serif text-2xl text-[var(--ink)]"
        >
          {slot.dateNL}
        </h2>
        <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{slot.time}</p>
        <p className="mt-1 text-xs italic text-[var(--ink-faint)]">
          Nog {remaining} {remaining === 1 ? "plek" : "plekken"} vrij
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm text-[var(--ink-soft)]">Naam</span>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              className="mt-1 w-full border border-[var(--border-soft)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
              style={{ borderRadius: "2px" }}
            />
          </label>

          <div>
            <span className="text-sm text-[var(--ink-soft)]">
              Met hoeveel kom je?
            </span>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                className="h-9 w-9 border border-[var(--border-soft)] text-lg text-[var(--ink)] hover:border-[var(--ink)]"
                style={{ borderRadius: "2px" }}
                aria-label="Eén minder"
              >
                −
              </button>
              <span className="w-8 text-center font-serif text-xl text-[var(--ink)]">
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setGuestCount((n) => Math.min(maxGuests, n + 1))
                }
                className="h-9 w-9 border border-[var(--border-soft)] text-lg text-[var(--ink)] hover:border-[var(--ink)]"
                style={{ borderRadius: "2px" }}
                aria-label="Eén meer"
              >
                +
              </button>
              <span className="text-xs italic text-[var(--ink-faint)]">
                max {maxGuests}
              </span>
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-[var(--ink-soft)]">
              Berichtje (optioneel)
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 w-full resize-none border border-[var(--border-soft)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--ink)]"
              style={{ borderRadius: "2px" }}
            />
          </label>
        </div>

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
            Terug
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-2 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--cream)] hover:text-[var(--ink)] disabled:opacity-60"
            style={{ borderRadius: "2px" }}
          >
            {submitting ? "Bezig…" : "Bevestig boeking"}
          </button>
        </div>
      </form>
    </div>
  );
}
