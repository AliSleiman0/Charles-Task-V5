export type EventStatus = 'upcoming' | 'attending' | 'maybe' | 'declined';
export type ResponseStatus = 'attending' | 'maybe' | 'declined' | 'pending';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_datetime: string;
  status: EventStatus;
  created_at: string;
  is_public: boolean;
  user?: User;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string | null;
  email: string;
  response_status: ResponseStatus;
  created_at: string;
  user?: User;
  event?: Event;
}

export interface EventWithParticipants extends Event {
  participants: EventParticipant[];
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  event_datetime: string;
  status?: EventStatus;
  is_public?: boolean;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export interface InviteParticipantInput {
  event_id: string;
  email: string;
}

export interface EventFilters {
  search?: string;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  attendingEvents: number;
  pendingInvitations: number;
}
