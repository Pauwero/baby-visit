export type Booking = {
  id: string;
  slotId: string;
  name: string;
  guestCount: number;
  message?: string;
  createdAt: string;
};

export type BookingsBlob = {
  version: 1;
  bookings: Booking[];
};

export type BookedIds = Record<string, string>;
