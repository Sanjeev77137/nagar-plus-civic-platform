import { useEffect, useState } from 'react';
import { supabase, Ticket } from '@/lib/supabase';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const { data, error: err } = await supabase
      .from('civic_tickets')
      .select('*')
      .order('created_at', { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setTickets(data ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { tickets, loading, error, refresh };
}

export async function ensureSeedTicket(): Promise<void> {
  const { data } = await supabase
    .from('civic_tickets')
    .select('ticket_no')
    .eq('ticket_no', 'NG-8842')
    .maybeSingle();
  if (!data) {
    await supabase.from('civic_tickets').insert({
      ticket_no: 'NG-8842',
      issue: 'Pothole',
      department: 'PWD Road Maintenance',
      state: 'Bihar',
      district: 'Banka',
      ward: 'Ward 12',
      status: 'dispatched',
    });
  }
}

export async function createTicket(ticket: {
  issue: string;
  department: string;
  state: string;
  district: string;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gps_accuracy?: number | null;
  address?: string | null;
  image_url?: string | null;
}): Promise<Ticket | null> {
  const ticketNo = `NG-${Math.floor(1000 + Math.random() * 9000)}`;
  const { data, error } = await supabase
    .from('civic_tickets')
    .insert({
      ticket_no: ticketNo,
      issue: ticket.issue,
      department: ticket.department,
      state: ticket.state,
      district: ticket.district,
      ward: 'Ward 12',
      status: 'reported',
      image_url: ticket.image_url ?? null,
      location_text: ticket.location_text ?? null,
      latitude: ticket.latitude ?? null,
      longitude: ticket.longitude ?? null,
      gps_accuracy: ticket.gps_accuracy ?? null,
      address: ticket.address ?? null,
    })
    .select()
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function verifyTicket(ticketNo: string): Promise<boolean> {
  const { error } = await supabase
    .from('civic_tickets')
    .update({ verified: true, status: 'resolved' })
    .eq('ticket_no', ticketNo);
  return !error;
}
