export type Slot = {
  id: string;
  dateNL: string;
  time: string;
  note: string;
};

export const SLOTS: Slot[] = [
  { id: "2026-05-05", dateNL: "Dinsdag 5 mei", time: "17:00 – 19:30", note: "" },
  { id: "2026-05-12", dateNL: "Dinsdag 12 mei", time: "18:00 – 20:00", note: "Robin werkt overdag — bezoek start later" },
  { id: "2026-05-19", dateNL: "Dinsdag 19 mei", time: "17:00 – 19:30", note: "" },
  { id: "2026-05-26", dateNL: "Dinsdag 26 mei", time: "17:00 – 19:30", note: "" },
  { id: "2026-06-02", dateNL: "Dinsdag 2 juni", time: "17:00 – 19:30", note: "" },
  { id: "2026-06-09", dateNL: "Dinsdag 9 juni", time: "17:00 – 19:30", note: "" },
  { id: "2026-06-16", dateNL: "Dinsdag 16 juni", time: "17:00 – 19:30", note: "" },
  { id: "2026-06-23", dateNL: "Dinsdag 23 juni", time: "17:00 – 19:30", note: "" },
  { id: "2026-06-30", dateNL: "Dinsdag 30 juni", time: "17:00 – 19:30", note: "" },
];

export const CAPACITY = 8;

export function isSlotPast(slotId: string, now: Date = new Date()): boolean {
  return new Date(`${slotId}T20:30:00`) < now;
}
