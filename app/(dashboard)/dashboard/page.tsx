import { Calendar, CalendarCheck, Clock, Mail } from 'lucide-react';
import { getDashboardStats, getUpcomingEvents } from '@/app/actions/events';
import StatsCard from '@/components/StatsCard';
import EventCard from '@/components/EventCard';
import WeeklySummary from '@/components/WeeklySummary';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const upcomingEvents = await getUpcomingEvents(5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s an overview of your events.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Upcoming"
          value={stats.upcomingEvents}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Attending"
          value={stats.attendingEvents}
          icon={CalendarCheck}
          color="yellow"
        />
        <StatsCard
          title="Pending Invitations"
          value={stats.pendingInvitations}
          icon={Mail}
          color="purple"
        />
      </div>

      {/* AI Weekly Summary */}
      <WeeklySummary />

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
          <Link href="/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            description="Create your first event to get started with your schedule."
            actionLabel="Create Event"
            actionHref="/events/new"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
