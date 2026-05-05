import type { BookedIds } from "./types";

const KEY = "bezoek-bookings-v1";

function read(): BookedIds {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: BookedIds = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

function write(value: BookedIds): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // ignore quota / disabled storage
  }
}

export function getBookedIds(): BookedIds {
  return read();
}

export function addBookedId(slotId: string, bookingId: string): BookedIds {
  const next = { ...read(), [slotId]: bookingId };
  write(next);
  return next;
}

