/*
# Add location, GPS and verification fields to civic_tickets

1. Modified Tables
- `civic_tickets` — new nullable columns (no existing data affected):
  - `location_text` (text) — citizen-entered City / Village / Ward & Landmark description
  - `latitude` (double precision) — GPS latitude captured from the browser
  - `longitude` (double precision) — GPS longitude captured from the browser
  - `gps_accuracy` (double precision) — GPS accuracy in meters
  - `address` (text) — reverse-geocoded street address (OpenStreetMap Nominatim)
  - `verified` (boolean, default false) — set true when before/after photos confirm the fix

2. Security
- No policy changes: table-level SELECT/INSERT/UPDATE grants for anon + authenticated already exist,
  and RLS policies are row-wide, so the new columns are covered automatically.

3. Notes
- All columns nullable with safe defaults — idempotent via IF NOT EXISTS, safe to re-run.
*/

ALTER TABLE civic_tickets ADD COLUMN IF NOT EXISTS location_text text;
ALTER TABLE civic_tickets ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE civic_tickets ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE civic_tickets ADD COLUMN IF NOT EXISTS gps_accuracy double precision;
ALTER TABLE civic_tickets ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE civic_tickets ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
