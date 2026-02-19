import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Pencil, ArrowLeft, Globe, Lock } from 'lucide-react';
import { getEventById } from '@/app/actions/events';
import { getEventParticipants } from '@/app/actions/invitations';
import { getUser } from '@/app/actions/auth';
import { formatDate, getStatusColor } from '@/lib/utils';
import ParticipantsList from '@/components/ParticipantsList';

interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const [event, user] = await Promise.all([
    getEventById(params.id),
    getUser(),
  ]);

  if (!event) {
    notFound();
  }

  const participants = await getEventParticipants(params.id);
  const isOwner = event.user_id === user?.id;

  return (
    <div className="max-w-4xl">
      {/* Back button */}
      <Link
        href="/events"
        className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to events</span>
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`badge ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  {event.is_public ? (
                    <span className="badge bg-gray-100 text-gray-600 flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-600 flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Private</span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              </div>
              {isOwner && (
                <Link
                  href={`/events/${params.id}/edit`}
                  className="btn-secondary flex items-center space-x-1"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
              )}
            </div>

            {event.description && (
              <p className="mt-4 text-gray-600">{event.description}</p>
            )}

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{formatDate(event.event_datetime)}</span>
              </div>
              {event.location && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-3 text-gray-600">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>Created {formatDate(event.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Participants */}
        <div>
          <ParticipantsList
            eventId={params.id}
            participants={participants}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
