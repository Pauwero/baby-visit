"use client";

import type { Slot } from "@/lib/slots";
import type { Booking } from "@/lib/types";
import Dots from "./Dots";

type Props = {
  slot: Slot;
  bookings: Booking[];
  filled: number;
  capacity: number;
  past: boolean;
  ownBookingId: string | undefined;
  adminMode: boolean;
  onBook: () => void;
  onCancel: (bookingId: string) => void;
  onAdminDelete: (bookingId: string) => void;
};

export default function SlotCard({
  slot,
  bookings,
  filled,
  capacity,
  past,
  ownBookingId,
  adminMode,
  onBook,
  onCancel,
  onAdminDelete,
}: Props) {
  const full = filled >= capacity;
  const ownBorder = !!ownBookingId;

  return (
    <article
      className="relative overflow-hidden transition"
      style={{
        backgroundColor: full ? "var(--paper-dark)" : "var(--cream)",
        border: ownBorder
          ? "2px solid var(--ink)"
          : "1px solid var(--border-soft)",
        borderRadius: "2px",
        padding: "1.25rem 1.25rem 1.1rem",
        opacity: past ? 0.55 : 1,
      }}
    >
      {past ? (
        <span
          className="stamp pointer-events-none absolute right-3 top-3 text-2xl text-[var(--ink-soft)]"
          style={{ transform: "rotate(-3deg)" }}
        >
          Voorbij
        </span>
      ) : null}

      {full && !past ? (
        <span
          className="stamp pointer-events-none absolute right-3 top-3 text-2xl text-[var(--terracotta)]"
          style={{ transform: "rotate(-3deg)" }}
        >
          Volzet
        </span>
      ) : null}

      {ownBorder && !past ? (
        <span
          className="absolute right-3 top-3 rounded-sharp border border-[var(--ink)] bg-[var(--paper)] px-2 py-0.5 font-serif text-xs italic text-[var(--ink)]"
          style={{ borderRadius: "2px" }}
        >
          Jouw bezoek
        </span>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl text-[var(--ink)]">
            {slot.dateNL}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{slot.time}</p>
          {slot.note ? (
            <p className="mt-2 max-w-md text-sm italic text-[var(--ink-faint)]">
              {slot.note}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Dots filled={filled} capacity={capacity} />
          <p className="text-xs text-[var(--ink-faint)]">
            {filled} van {capacity}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {bookings.length > 0 ? (
          <ul className="space-y-1 text-sm text-[var(--ink-soft)]">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-serif text-[var(--ink)]">{b.name}</span>
                <span className="text-[var(--ink-faint)]">
                  {b.guestCount === 1 ? "alleen" : `met ${b.guestCount}`}
                </span>
                {b.message ? (
                  <span className="basis-full italic text-[var(--ink-faint)]">
                    &ldquo;{b.message}&rdquo;
                  </span>
                ) : null}
                {adminMode ? (
                  <button
                    type="button"
                    onClick={() => onAdminDelete(b.id)}
                    className="text-xs italic text-[var(--terracotta)] underline-offset-2 hover:underline"
                  >
                    verwijder
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-[var(--ink-faint)]">
            Nog niemand geboekt.
          </p>
        )}

        <div className="flex items-center gap-3">
          {ownBookingId ? (
            <button
              type="button"
              onClick={() => onCancel(ownBookingId)}
              className="border border-transparent px-3 py-2 text-sm italic text-[var(--ink-soft)] underline-offset-4 hover:underline"
              style={{ borderRadius: "2px" }}
            >
              Annuleren
            </button>
          ) : null}

          {!past && !full && !ownBookingId ? (
            <button
              type="button"
              onClick={onBook}
              className="border-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--cream)] hover:text-[var(--ink)]"
              style={{ borderRadius: "2px" }}
            >
              Boek een plek
            </button>
          ) : null}

          {full && !past && !ownBookingId ? (
            <p className="text-sm italic text-[var(--ink-soft)]">
              Helaas, geen plekken meer
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
