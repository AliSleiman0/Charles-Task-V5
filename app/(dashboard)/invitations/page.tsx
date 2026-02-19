import { Mail } from 'lucide-react';
import { getMyInvitations } from '@/app/actions/invitations';
import InvitationCard from '@/components/InvitationCard';
import EmptyState from '@/components/EmptyState';

export default async function InvitationsPage() {
  const invitations = await getMyInvitations();

  const pendingInvitations = invitations.filter(i => i.response_status === 'pending');
  const respondedInvitations = invitations.filter(i => i.response_status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Invitations</h1>
        <p className="text-gray-500">Events you&apos;ve been invited to</p>
      </div>

      {/* Pending Invitations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Pending ({pendingInvitations.length})
        </h2>
        {pendingInvitations.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-center py-4">No pending invitations</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pendingInvitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </div>
        )}
      </div>

      {/* Responded Invitations */}
      {respondedInvitations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Responded ({respondedInvitations.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {respondedInvitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {invitations.length === 0 && (
        <EmptyState
          icon={Mail}
          title="No invitations yet"
          description="When someone invites you to an event, it will appear here."
        />
      )}
    </div>
  );
}
