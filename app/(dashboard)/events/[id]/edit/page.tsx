import { notFound, redirect } from 'next/navigation';
import { getEventById } from '@/app/actions/events';
import { getUser } from '@/app/actions/auth';
import EventForm from '@/components/EventForm';

interface EditEventPageProps {
  params: { id: string };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const [event, user] = await Promise.all([
    getEventById(params.id),
    getUser(),
  ]);

  if (!event) {
    notFound();
  }

  // Only owner can edit
  if (event.user_id !== user?.id) {
    redirect('/events');
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-500">Update your event details</p>
      </div>

      <div className="card">
        <EventForm mode="edit" event={event} />
      </div>
    </div>
  );
}
