'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { EventParticipant, ResponseStatus } from '@/types/database';

export async function getEventParticipants(eventId: string): Promise<EventParticipant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('event_participants')
    .select('*, user:profiles(*)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }

  return data || [];
}

export async function inviteParticipant(eventId: string, email: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user owns the event
  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single();

  if (!event) {
    return { error: 'Event not found or not authorized' };
  }

  // Check if already invited
  const { data: existing } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('email', email)
    .single();

  if (existing) {
    return { error: 'User already invited' };
  }

  // Check if email belongs to an existing user
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  const { data, error } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      email,
      user_id: existingUser?.id || null,
      response_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error inviting participant:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  return { data };
}

export async function removeParticipant(participantId: string, eventId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('id', participantId);

  if (error) {
    console.error('Error removing participant:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function updateParticipantResponse(
  participantId: string,
  status: ResponseStatus
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('event_participants')
    .update({ response_status: status })
    .eq('id', participantId)
    .select('event_id')
    .single();

  if (error) {
    console.error('Error updating response:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${data?.event_id}`);
  revalidatePath('/invitations');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getMyInvitations(): Promise<(EventParticipant & { event: any })[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Get user's email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  if (!profile) return [];

  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      event:events(*, user:profiles(*))
    `)
    .eq('email', profile.email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    return [];
  }

  return data || [];
}

export async function respondToInvitation(participantId: string, status: ResponseStatus) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('event_participants')
    .update({ response_status: status })
    .eq('id', participantId)
    .select()
    .single();

  if (error) {
    console.error('Error responding to invitation:', error);
    return { error: error.message };
  }

  revalidatePath('/invitations');
  revalidatePath('/dashboard');
  return { data };
}
