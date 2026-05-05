import BookingPage from "@/components/BookingPage";
import { readBookings } from "@/lib/storage-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Page() {
  const bookings = await readBookings();
  return <BookingPage initialBookings={bookings} />;
}
