import EventForm from '@/components/EventForm';

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="text-gray-500">Fill in the details to create a new event</p>
      </div>

      <div className="card">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
