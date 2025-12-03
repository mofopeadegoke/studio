
'use client';

import { EventCard } from '@/components/app/event-card';
import { useAuth } from '@/context/auth-context';
import { getAllEvents } from '@/api/auth';
import { useState, useEffect } from 'react';
import { challenges } from '@/lib/data';
import type { BackendEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function EventsPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<BackendEvent[]>([]);
  if (!currentUser) return null;

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getAllEvents();
      setEvents(data.events);
    };
    fetchEvents();
  }, []);


  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Upcoming Events</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard key={event.id} event={event} currentUserId={currentUser.id} />
            ))
          ) : (
            <div>No events available.</div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Active Challenges</h1>
        <div className="grid gap-6 md:grid-cols-2">
            {challenges.map(challenge => (
                <Card key={challenge.id}>
                    <CardHeader>
                        <CardTitle className='font-headline'>{challenge.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{challenge.description}</p>
                        <p className="text-sm font-semibold">
                            To participate, make a post with the hashtag: <span className="text-primary font-mono bg-muted px-2 py-1 rounded">{challenge.hashtag}</span>
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
