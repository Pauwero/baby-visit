import { NextResponse } from "next/server";
import { writeBookings } from "@/lib/storage-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_CODE;
  const provided = req.headers.get("x-admin-code");
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Niet gemachtigd." }, { status: 401 });
  }

  try {
    await writeBookings([]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin-reset] storage failure:", err);
    return NextResponse.json(
      { error: "Kon niet resetten." },
      { status: 500 },
    );
  }
}
