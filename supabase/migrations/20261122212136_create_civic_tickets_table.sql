/*
# Create civic_tickets table (single-tenant, no auth)

1. New Tables
- `civic_tickets`
  - `id` (uuid, primary key, auto-generated)
  - `ticket_no` (text, unique, e.g. "NG-8842") — human-readable ticket identifier
  - `issue` (text, not null) — issue type, e.g. "Pothole", "Garbage"
  - `department` (text, not null) — auto-assigned department, e.g. "PWD Road Maintenance"
  - `state` (text, not null) — state selected by the reporter
  - `district` (text, not null) — district selected by the reporter
  - `ward` (text) — ward identifier for admin dispatch
  - `status` (text, not null, default 'reported') — one of: reported, assigned, dispatched, resolved
  - `severity` (text, default 'medium') — optional severity label
  - `image_url` (text, null) — data URL of the uploaded photo (optional)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Modified Tables
- none

3. Security
- Enable RLS on `civic_tickets`.
- Grant SELECT, INSERT, UPDATE to `anon` + `authenticated` (no sign-in screen in this app; data is intentionally shared/public).
- Four separate policies (SELECT/INSERT/UPDATE/DELETE) scoped TO anon, authenticated. DELETE not granted since app never deletes tickets.

4. Notes
- Seeded reference ticket NG-8842 (Pothole, PWD Road Maintenance, Banka, Bihar) is inserted by the app on first load if missing, so rebuilds stay idempotent.
*/

CREATE TABLE IF NOT EXISTS civic_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no text UNIQUE NOT NULL,
  issue text NOT NULL,
  department text NOT NULL,
  state text NOT NULL DEFAULT 'Bihar',
  district text NOT NULL DEFAULT 'Banka',
  ward text,
  status text NOT NULL DEFAULT 'reported',
  severity text NOT NULL DEFAULT 'medium',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE civic_tickets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON civic_tickets TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_tickets" ON civic_tickets;
CREATE POLICY "public_read_tickets" ON civic_tickets
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_tickets" ON civic_tickets;
CREATE POLICY "public_insert_tickets" ON civic_tickets
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_tickets" ON civic_tickets;
CREATE POLICY "public_update_tickets" ON civic_tickets
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
