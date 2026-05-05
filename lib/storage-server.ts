import "server-only";
import { put, list } from "@vercel/blob";
import type { Booking, BookingsBlob } from "./types";

const BLOB_PATHNAME = "bookings.json";

export async function readBookings(): Promise<Booking[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "[storage] BLOB_READ_WRITE_TOKEN is not set. Connect a Vercel Blob store to the project and redeploy.",
    );
    return [];
  }
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
    if (!res.ok) {
      console.error(
        `[storage] blob fetch failed: ${res.status} ${res.statusText}`,
      );
      return [];
    }

    const data = (await res.json()) as Partial<BookingsBlob>;
    return Array.isArray(data?.bookings) ? data.bookings : [];
  } catch (err) {
    console.error("[storage] readBookings failed:", err);
    return [];
  }
}

export async function writeBookings(bookings: Booking[]): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Connect a Vercel Blob store to the project (Storage → Create → Blob), then redeploy.",
    );
  }
  const payload: BookingsBlob = { version: 1, bookings };
  await put(BLOB_PATHNAME, JSON.stringify(payload), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
