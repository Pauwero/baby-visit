import { NextResponse } from "next/server";
import { readBookings, writeBookings } from "@/lib/storage-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { slotId?: unknown; bookingId?: unknown };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const slotId = typeof body.slotId === "string" ? body.slotId : "";
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";

  if (!slotId || !bookingId) {
    return NextResponse.json(
      { error: "slotId en bookingId zijn vereist." },
      { status: 400 },
    );
  }

  try {
    const bookings = await readBookings();
    const exists = bookings.some(
      (b) => b.id === bookingId && b.slotId === slotId,
    );
    if (!exists) {
      return NextResponse.json({ error: "Boeking niet gevonden." }, { status: 404 });
    }
    const next = bookings.filter(
      (b) => !(b.id === bookingId && b.slotId === slotId),
    );
    await writeBookings(next);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/cancel] storage failure:", err);
    return NextResponse.json(
      { error: "Kon boeking niet annuleren." },
      { status: 500 },
    );
  }
}
