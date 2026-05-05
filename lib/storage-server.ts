import "server-only";
import { put, list } from "@vercel/blob";
import type { Booking, BookingsBlob } from "./types";

const BLOB_PATHNAME = "bookings.json";

export async function readBookings(): Promise<Booking[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    const blob = blobs
      .filter((b) => b.pathname === BLOB_PATHNAME)
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )[0];
    if (!blob) return [];

    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = (await res.json()) as Partial<BookingsBlob>;
    return Array.isArray(data?.bookings) ? data.bookings : [];
  } catch {
    return [];
  }
}

export async function writeBookings(bookings: Booking[]): Promise<void> {
  const payload: BookingsBlob = { version: 1, bookings };
  await put(BLOB_PATHNAME, JSON.stringify(payload), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
