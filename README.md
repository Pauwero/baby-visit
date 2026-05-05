# baby-visit

A small Dutch visit-booking page for our newborn. People pick a Tuesday slot,
enter their name and party size, and see who else has booked once they've
booked themselves. Persists to a single JSON blob in Vercel Blob storage.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- `@vercel/blob` for shared persistence (one JSON file)
- localStorage for tracking the visitor's own booking IDs

## Local development

1. `pnpm install`
2. **Set up Vercel Blob** (needed even for local dev — there's no in-memory fallback):
   - Sign in at [vercel.com](https://vercel.com) and create or pick a project
   - Project → **Storage** → **Create Database** → **Blob** → connect to the project
   - Open the Blob store, go to **.env.local** tab, copy `BLOB_READ_WRITE_TOKEN`
3. `cp .env.example .env.local` and paste the token plus pick an admin code
4. `pnpm dev` — first booking creates the blob automatically

## Deployment

1. Push to GitHub
2. Import the repo into Vercel
3. The Blob integration auto-injects `BLOB_READ_WRITE_TOKEN`. Add `ADMIN_CODE`
   and `NEXT_PUBLIC_ADMIN_CODE` manually under Project → Settings → Environment Variables
4. Deploy

## Common edits

**Change the admin code.** Update `ADMIN_CODE` and `NEXT_PUBLIC_ADMIN_CODE`
in Vercel → Project → Settings → Environment Variables, then redeploy.

**Add or remove a slot.** Edit `lib/slots.ts` — slots are hardcoded. Push to
trigger a redeploy. Existing bookings on a removed slot stay in the blob but
won't render anywhere.

**Inspect bookings.** Vercel dashboard → Storage → your Blob store → open
`bookings.json`. Or hit `https://<your-deployment>/api/bookings` (returns
the full list as JSON, no auth — fine since the names are visible in the UI
to anyone who's booked).

**Back up bookings.** Either download `bookings.json` from the Blob dashboard
or save the response from `/api/bookings`.

**Delete a single booking as admin.** Click "Beheer" in the footer, enter the
admin code, then "verwijder" appears next to each booking.

## Data model

Stored at `bookings.json` in the Blob store:

```json
{
  "version": 1,
  "bookings": [
    {
      "id": "b_abc1234567",
      "slotId": "2026-05-05",
      "name": "Marie Janssens",
      "guestCount": 2,
      "message": "Kijken er hard naar uit!",
      "createdAt": "2026-05-01T18:32:11.000Z"
    }
  ]
}
```

Concurrency is last-write-wins. Acceptable here: ~50 bookings over 2 months,
low traffic.
