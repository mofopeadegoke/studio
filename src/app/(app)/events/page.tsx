import { EventCard } from '@/components/app/event-card';
import { events } from '@/lib/data';
import { users } from '@/lib/data';

export default function EventsPage() {
  const currentUser = users.find(u => u.id === '1'); // Simulate logged in user
  if (!currentUser) return null;

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold font-headline">Upcoming Events</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <EventCard key={event.id} event={event} currentUserId={currentUser.id} />
        ))}
      </div>
    </div>
  );
}
