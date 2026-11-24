import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TicketStatus = 'reported' | 'assigned' | 'dispatched' | 'resolved';

export interface Ticket {
  id: string;
  ticket_no: string;
  issue: string;
  department: string;
  state: string;
  district: string;
  ward: string | null;
  status: TicketStatus;
  severity: string;
  image_url: string | null;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_accuracy: number | null;
  address: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export const STATUS_STEPS: TicketStatus[] = ['reported', 'assigned', 'dispatched', 'resolved'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  reported: 'Reported',
  assigned: 'Auto Assigned to PWD',
  dispatched: 'Team Dispatched',
  resolved: 'Resolved & Verified',
};
