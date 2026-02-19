'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CreateEventInput, UpdateEventInput, EventFilters, Event } from '@/types/database';

export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from('events')
    .select('*, user:profiles(*)')
    .eq('user_id', user.id)
    .order('event_datetime', { ascending: true });

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.startDate) {
    query = query.gte('event_datetime', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('event_datetime', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data || [];
}

export async function getUpcomingEvents(limit = 5): Promise<Event[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*, user:profiles(*)')
    .eq('user_id', user.id)
    .gte('event_datetime', new Date().toISOString())
    .order('event_datetime', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data || [];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*, user:profiles(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function createEvent(input: CreateEventInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');
  return { data };
}

export async function updateEvent(input: UpdateEventInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { id, ...updateData } = input;

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');
  revalidatePath(`/events/${id}`);
  return { data };
}

export async function updateEventStatus(id: string, status: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event status:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');
  return { data };
}

export async function deleteEvent(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting event:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/events');
  return { success: true };
}

export async function getDashboardStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      attendingEvents: 0,
      pendingInvitations: 0,
    };
  }

  // Get total events
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get upcoming events count
  const { count: upcomingEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('event_datetime', new Date().toISOString());

  // Get attending events count
  const { count: attendingEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'attending');

  // Get pending invitations
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const { count: pendingInvitations } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('email', profile?.email || '')
    .eq('response_status', 'pending');

  return {
    totalEvents: totalEvents || 0,
    upcomingEvents: upcomingEvents || 0,
    attendingEvents: attendingEvents || 0,
    pendingInvitations: pendingInvitations || 0,
  };
}

export async function getEventsForWeek() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const startOfWeek = new Date();
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('event_datetime', startOfWeek.toISOString())
    .lte('event_datetime', endOfWeek.toISOString())
    .order('event_datetime', { ascending: true });

  if (error) {
    console.error('Error fetching week events:', error);
    return [];
  }

  return data || [];
}
