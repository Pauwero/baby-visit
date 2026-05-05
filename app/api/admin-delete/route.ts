import { NextResponse } from "next/server";
import { readBookings, writeBookings } from "@/lib/storage-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { bookingId?: unknown };

export async function POST(req: Request) {
  const expected = process.env.ADMIN_CODE;
  const provided = req.headers.get("x-admin-code");
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Niet gemachtigd." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId is vereist." },
      { status: 400 },
    );
  }

  try {
    const bookings = await readBookings();
    const exists = bookings.some((b) => b.id === bookingId);
    if (!exists) {
      return NextResponse.json({ error: "Boeking niet gevonden." }, { status: 404 });
    }
    const next = bookings.filter((b) => b.id !== bookingId);
    await writeBookings(next);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Kon boeking niet verwijderen." },
      { status: 500 },
    );
  }
}
