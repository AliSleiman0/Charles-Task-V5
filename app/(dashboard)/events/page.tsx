import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { getEvents } from '@/app/actions/events';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import EmptyState from '@/components/EmptyState';
import Loading from '@/components/Loading';
import type { EventFilters as Filters } from '@/types/database';

interface EventsPageProps {
  searchParams: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
  };
}

async function EventsList({ filters }: { filters: Filters }) {
  const events = await getEvents(filters);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No events found"
        description={
          Object.keys(filters).length > 0
            ? 'Try adjusting your filters to find events.'
            : 'Create your first event to get started.'
        }
        actionLabel="Create Event"
        actionHref="/events/new"
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function EventsPage({ searchParams }: EventsPageProps) {
  const filters: Filters = {
    search: searchParams.search,
    status: searchParams.status as any,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    location: searchParams.location,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500">Manage and organize all your events</p>
        </div>
        <Link href="/events/new" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>New Event</span>
        </Link>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <EventFilters />
      </Suspense>

      {/* Events Grid */}
      <Suspense fallback={<Loading />}>
        <EventsList filters={filters} />
      </Suspense>
    </div>
  );
}
