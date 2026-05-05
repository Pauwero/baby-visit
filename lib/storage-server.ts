import "server-only";
import { put, list, del } from "@vercel/blob";
import type { Booking, BookingsBlob } from "./types";

// Each write goes to a fresh randomly-suffixed pathname (e.g.
// bookings-abc123.json) so the CDN never serves a stale cached copy.
// Reads pick the most-recently-uploaded blob; the writer cleans up the
// older ones afterward.
const BLOB_PREFIX = "bookings";

export async function readBookings(): Promise<Booking[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "[storage] BLOB_READ_WRITE_TOKEN is not set. Connect a Vercel Blob store to the project and redeploy.",
    );
    return [];
  }
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    const latest = blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
    if (!latest) return [];

    const res = await fetch(latest.url, { cache: "no-store" });
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
  const fresh = await put(`${BLOB_PREFIX}.json`, JSON.stringify(payload), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
    cacheControlMaxAge: 60,
  });

  // Best-effort cleanup of older blobs so the bucket doesn't grow
  // unbounded. A failure here doesn't affect the write.
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    const stale = blobs
      .filter((b) => b.url !== fresh.url && b.pathname.endsWith(".json"))
      .map((b) => b.url);
    if (stale.length > 0) await del(stale);
  } catch (err) {
    console.warn("[storage] failed to clean up older blobs:", err);
  }
}
