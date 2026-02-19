'use client';

import { useState } from 'react';
import { Calendar, MapPin, User, Check, X, HelpCircle, Loader2 } from 'lucide-react';
import { formatDateShort, getStatusColor } from '@/lib/utils';
import { respondToInvitation } from '@/app/actions/invitations';
import type { EventParticipant, ResponseStatus } from '@/types/database';
import toast from 'react-hot-toast';

interface InvitationCardProps {
  invitation: EventParticipant & { event: any };
}

export default function InvitationCard({ invitation }: InvitationCardProps) {
  const [loading, setLoading] = useState<ResponseStatus | null>(null);

  const handleResponse = async (status: ResponseStatus) => {
    setLoading(status);
    try {
      const result = await respondToInvitation(invitation.id, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Marked as ${status}`);
      }
    } catch (error) {
      toast.error('Failed to respond');
    } finally {
      setLoading(null);
    }
  };

  const event = invitation.event;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>From: {event.user?.full_name || event.user?.email}</span>
          </div>
        </div>
        <span className={`badge ${getStatusColor(invitation.response_status)}`}>
          {invitation.response_status}
        </span>
      </div>

      {event.description && (
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{event.description}</p>
      )}

      <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDateShort(event.event_datetime)}</span>
        </div>
        {event.location && (
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {invitation.response_status === 'pending' && (
        <div className="mt-4 pt-4 border-t flex space-x-2">
          <button
            onClick={() => handleResponse('attending')}
            disabled={loading !== null}
            className="flex-1 btn-primary flex items-center justify-center space-x-1"
          >
            {loading === 'attending' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>Attending</span>
          </button>
          <button
            onClick={() => handleResponse('maybe')}
            disabled={loading !== null}
            className="flex-1 btn-secondary flex items-center justify-center space-x-1"
          >
            {loading === 'maybe' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HelpCircle className="h-4 w-4" />
            )}
            <span>Maybe</span>
          </button>
          <button
            onClick={() => handleResponse('declined')}
            disabled={loading !== null}
            className="flex-1 btn-danger flex items-center justify-center space-x-1"
          >
            {loading === 'declined' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>Decline</span>
          </button>
        </div>
      )}
    </div>
  );
}
