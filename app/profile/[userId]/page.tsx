import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDateShort, getStatusColor } from '@/lib/utils';

interface PublicProfilePageProps {
  params: { userId: string };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const supabase = createClient();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (!profile) {
    notFound();
  }

  // Get public events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', params.userId)
    .eq('is_public', true)
    .gte('event_datetime', new Date().toISOString())
    .order('event_datetime', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center space-x-2 text-primary-600 mb-6">
            <Calendar className="h-6 w-6" />
            <span className="font-bold">EventScheduler</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'User Profile'}
              </h1>
              <p className="text-gray-500">Public Events</p>
            </div>
          </div>
        </div>
      </header>

      {/* Events */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">
          Upcoming Events ({events?.length || 0})
        </h2>

        {!events || events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No public events available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((event) => (
              <div key={event.id} className="card">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {event.title}
                  </h3>
                  <span className={`badge ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {event.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {event.description}
                  </p>
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
