"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SLOTS, CAPACITY, isSlotPast, type Slot } from "@/lib/slots";
import type { Booking, BookedIds } from "@/lib/types";
import {
  getBookedIds,
  addBookedId,
  removeBookedId,
  setBookedIds as writeBookedIds,
} from "@/lib/storage-client";
import SlotCard from "./SlotCard";
import BookingModal from "./BookingModal";
import AdminModal from "./AdminModal";
import Toast from "./Toast";
import Sprig from "./Sprig";

type Props = {
  initialBookings: Booking[];
};

type ToastState = { name: string } | null;

export default function BookingPage({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [bookedIds, setBookedIds] = useState<BookedIds>({});
  const [openSlot, setOpenSlot] = useState<Slot | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // Hydrate localStorage-derived state on the client only.
  useEffect(() => {
    setBookedIds(getBookedIds());
  }, []);

  // Auto-dismiss toast after 6s.
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Self-heal localStorage: drop any (slotId → bookingId) entries that
  // no longer match a real booking on the server (e.g. admin-deleted
  // or after a full reset).
  useEffect(() => {
    if (Object.keys(bookedIds).length === 0) return;
    const real = new Set(bookings.map((b) => `${b.slotId}|${b.id}`));
    const cleaned: Record<string, string> = {};
    for (const [slotId, bookingId] of Object.entries(bookedIds)) {
      if (real.has(`${slotId}|${bookingId}`)) cleaned[slotId] = bookingId;
    }
    if (Object.keys(cleaned).length !== Object.keys(bookedIds).length) {
      setBookedIds(writeBookedIds(cleaned));
    }
  }, [bookings, bookedIds]);

  const hasOwnBooking = Object.keys(bookedIds).length > 0;
  const namesVisible = hasOwnBooking || adminCode !== null;

  const bookingsBySlot = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      (map[b.slotId] ??= []).push(b);
    }
    return map;
  }, [bookings]);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { bookings: Booking[] };
      if (Array.isArray(data.bookings)) setBookings(data.bookings);
    } catch {
      // network error — keep current state
    }
  }, []);

  const handleBook = useCallback(
    async (
      slot: Slot,
      input: { name: string; guestCount: number; message: string },
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      // Optimistic insert with a temporary id so the UI updates immediately.
      const tempId = `tmp_${Math.random().toString(36).slice(2, 10)}`;
      const optimistic: Booking = {
        id: tempId,
        slotId: slot.id,
        name: input.name.trim(),
        guestCount: input.guestCount,
        ...(input.message.trim() ? { message: input.message.trim() } : {}),
        createdAt: new Date().toISOString(),
      };
      setBookings((prev) => [...prev, optimistic]);

      try {
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slotId: slot.id,
            name: input.name.trim(),
            guestCount: input.guestCount,
            message: input.message.trim(),
          }),
        });

        if (!res.ok) {
          // Roll back the optimistic insert.
          setBookings((prev) => prev.filter((b) => b.id !== tempId));
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          return {
            ok: false,
            error: data.error ?? "Er ging iets mis. Probeer opnieuw.",
          };
        }

        const data = (await res.json()) as { booking: Booking };
        setBookedIds(addBookedId(slot.id, data.booking.id));
        await refetch();
        setToast({ name: data.booking.name });
        return { ok: true };
      } catch {
        setBookings((prev) => prev.filter((b) => b.id !== tempId));
        return { ok: false, error: "Geen verbinding. Probeer opnieuw." };
      }
    },
    [refetch],
  );

  const handleCancel = useCallback(
    async (slotId: string, bookingId: string) => {
      if (!window.confirm("Weet je zeker dat je je boeking wil annuleren?")) {
        return;
      }
      try {
        const res = await fetch("/api/cancel", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slotId, bookingId }),
        });
        if (res.ok) {
          setBookedIds(removeBookedId(slotId));
        }
      } finally {
        await refetch();
      }
    },
    [refetch],
  );

  const handleAdminDelete = useCallback(
    async (bookingId: string) => {
      if (!adminCode) return;
      if (!window.confirm("Boeking definitief verwijderen?")) return;
      try {
        const res = await fetch("/api/admin-delete", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-code": adminCode,
          },
          body: JSON.stringify({ bookingId }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          const hint =
            res.status === 401
              ? " — controleer dat ADMIN_CODE in Vercel gelijk is aan NEXT_PUBLIC_ADMIN_CODE en redeploy."
              : "";
          window.alert(
            `Verwijderen mislukt (${res.status}): ${data.error ?? "onbekende fout"}${hint}`,
          );
        }
      } finally {
        await refetch();
      }
    },
    [adminCode, refetch],
  );

  const handleAdminReset = useCallback(async () => {
    if (!adminCode) return;
    if (
      !window.confirm(
        "Alle boekingen wissen? Dit kan niet ongedaan gemaakt worden.",
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/admin-reset", {
        method: "POST",
        headers: { "x-admin-code": adminCode },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        const hint =
          res.status === 401
            ? " — controleer dat ADMIN_CODE in Vercel gelijk is aan NEXT_PUBLIC_ADMIN_CODE en redeploy."
            : "";
        window.alert(
          `Reset mislukt (${res.status}): ${data.error ?? "onbekende fout"}${hint}`,
        );
      }
    } finally {
      await refetch();
    }
  }, [adminCode, refetch]);

  return (
    <div className="relative">
      <header className="mx-auto max-w-2xl px-6 pt-12 pb-10 text-center">
        <Sprig className="mx-auto mb-6 h-8 w-auto text-[var(--sage)]" />
        <p className="font-serif text-5xl italic text-[var(--terracotta)] md:text-6xl">
          Rémi
        </p>
        <h1 className="mt-3 font-serif text-3xl text-[var(--ink)] md:text-4xl">
          Onze kleine spruit
          <br />
          is er.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-[var(--ink-soft)]">
          We zouden jullie graag laten kennismaken met onze kleine man. Sarah is
          nog wat aan het herstellen, dus we doen het in kleine groepjes. We
          zorgen voor wat hapjes — chips, pizza, dat soort dingen — en drankjes.
          Kies hieronder een dinsdag die past, en we zien jullie graag.
        </p>
        <p className="mt-5 font-serif italic text-[var(--ink)]">
          — Robin &amp; Sarah
        </p>
        <p className="mx-auto mt-8 max-w-md text-sm italic text-[var(--ink-faint)]">
          Zodra je een moment kiest, zie je wie er nog meer komt.
        </p>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16">
        {SLOTS.map((slot) => {
          const slotBookings = bookingsBySlot[slot.id] ?? [];
          const filled = slotBookings.reduce(
            (sum, b) => sum + b.guestCount,
            0,
          );
          const ownBookingId = bookedIds[slot.id];
          return (
            <SlotCard
              key={slot.id}
              slot={slot}
              bookings={slotBookings}
              filled={filled}
              capacity={CAPACITY}
              past={isSlotPast(slot.id)}
              namesVisible={namesVisible}
              ownBookingId={ownBookingId}
              adminMode={adminCode !== null}
              onBook={() => setOpenSlot(slot)}
              onCancel={(bookingId) => handleCancel(slot.id, bookingId)}
              onAdminDelete={handleAdminDelete}
            />
          );
        })}
      </main>

      <footer className="px-6 pb-12 text-center">
        <Sprig className="mx-auto mb-4 h-6 w-auto text-[var(--sage)]" />
        {adminCode !== null ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs italic text-[var(--ink-faint)]">
              Beheer ontgrendeld
            </p>
            <button
              type="button"
              onClick={handleAdminReset}
              className="text-sm italic text-[var(--terracotta)] underline-offset-4 hover:underline"
            >
              Reset alle boekingen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            className="text-sm italic text-[var(--ink-faint)] underline-offset-4 hover:underline"
          >
            Beheer
          </button>
        )}
      </footer>

      {openSlot ? (
        <BookingModal
          slot={openSlot}
          remaining={
            CAPACITY -
            (bookingsBySlot[openSlot.id] ?? []).reduce(
              (s, b) => s + b.guestCount,
              0,
            )
          }
          onClose={() => setOpenSlot(null)}
          onSubmit={async (input) => {
            const result = await handleBook(openSlot, input);
            if (result.ok) setOpenSlot(null);
            return result;
          }}
        />
      ) : null}

      {adminOpen ? (
        <AdminModal
          onClose={() => setAdminOpen(false)}
          onUnlock={(code) => {
            setAdminCode(code);
            setAdminOpen(false);
          }}
        />
      ) : null}

      {toast ? <Toast name={toast.name} /> : null}
    </div>
  );
}
