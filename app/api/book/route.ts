import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { readBookings, writeBookings } from "@/lib/storage-server";
import { SLOTS, CAPACITY, isSlotPast } from "@/lib/slots";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  slotId?: unknown;
  name?: unknown;
  guestCount?: unknown;
  message?: unknown;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const slotId = typeof body.slotId === "string" ? body.slotId : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const guestCount =
    typeof body.guestCount === "number" ? body.guestCount : NaN;
  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!SLOTS.some((s) => s.id === slotId)) {
    return NextResponse.json({ error: "Onbekend tijdstip." }, { status: 400 });
  }
  if (isSlotPast(slotId)) {
    return NextResponse.json(
      { error: "Dit tijdstip is voorbij." },
      { status: 400 },
    );
  }
  if (!name) {
    return NextResponse.json({ error: "Vul je naam in." }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json({ error: "Naam is te lang." }, { status: 400 });
  }
  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > CAPACITY
  ) {
    return NextResponse.json(
      { error: "Aantal moet tussen 1 en 8 zijn." },
      { status: 400 },
    );
  }
  if (message.length > 500) {
    return NextResponse.json(
      { error: "Berichtje is te lang." },
      { status: 400 },
    );
  }

  try {
    const bookings = await readBookings();
    const taken = bookings
      .filter((b) => b.slotId === slotId)
      .reduce((sum, b) => sum + b.guestCount, 0);
    const remaining = CAPACITY - taken;

    if (guestCount > remaining) {
      return NextResponse.json(
        {
          error: `Te weinig plekken — er zijn nog ${remaining} plekken vrij.`,
        },
        { status: 409 },
      );
    }

    const booking: Booking = {
      id: `b_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
      slotId,
      name,
      guestCount,
      ...(message ? { message } : {}),
      createdAt: new Date().toISOString(),
    };

    await writeBookings([...bookings, booking]);
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json(
      { error: "Kon je boeking niet opslaan." },
      { status: 500 },
    );
  }
}
