'use client';

import { useState } from 'react';
import { User, Mail, Trash2, Loader2, UserPlus } from 'lucide-react';
import { inviteParticipant, removeParticipant } from '@/app/actions/invitations';
import { getStatusColor } from '@/lib/utils';
import type { EventParticipant } from '@/types/database';
import toast from 'react-hot-toast';

interface ParticipantsListProps {
  eventId: string;
  participants: EventParticipant[];
  isOwner: boolean;
}

export default function ParticipantsList({ eventId, participants, isOwner }: ParticipantsListProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const result = await inviteParticipant(eventId, email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Invitation sent!');
        setEmail('');
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (participantId: string) => {
    if (!confirm('Remove this participant?')) return;

    setRemovingId(participantId);
    try {
      const result = await removeParticipant(participantId, eventId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Participant removed');
      }
    } catch (error) {
      toast.error('Failed to remove participant');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Participants</h3>

      {/* Invite Form */}
      {isOwner && (
        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to invite"
              className="input-field pl-10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>Invite</span>
          </button>
        </form>
      )}

      {/* Participants List */}
      {participants.length === 0 ? (
        <p className="text-gray-500 text-sm">No participants yet.</p>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
                removingId === participant.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {participant.user?.full_name || participant.email}
                  </p>
                  {participant.user?.full_name && (
                    <p className="text-xs text-gray-500">{participant.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`badge ${getStatusColor(participant.response_status)}`}>
                  {participant.response_status}
                </span>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(participant.id)}
                    disabled={removingId === participant.id}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
