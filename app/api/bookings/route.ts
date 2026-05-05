import { NextResponse } from "next/server";
import { readBookings } from "@/lib/storage-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await readBookings();
    return NextResponse.json(
      { bookings },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Kon boekingen niet laden." },
      { status: 500 },
    );
  }
}
