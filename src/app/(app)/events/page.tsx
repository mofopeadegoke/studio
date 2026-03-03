'use client';

import { useState, useEffect } from 'react';
import { EventCard } from '@/components/app/event-card';
import { useAuth } from '@/context/auth-context';
import { getAllEventsPublic, getAllChallenges } from '@/api/auth';

import type { BackendEvent, Challenge } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LucideLoader } from 'lucide-react';

export default function EventsPage() {
  const { currentUser } = useAuth();
  
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]); // Dynamic state for challenges
  
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEventsPublic();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    const fetchChallenges = async () => {
      try {
        const data = await getAllChallenges();
        setChallenges(data.challenges || []);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setIsLoadingChallenges(false);
      }
    };

    fetchEvents();
    fetchChallenges();
  }, []);

  if (!currentUser) return null;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Upcoming Events</h1>
        
        {isLoadingEvents ? (
          <div className="flex justify-center py-8">
            <LucideLoader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.length > 0 ? (
              events.map(event => (
                <EventCard key={event.id} event={event} currentUserId={currentUser.id} />
              ))
            ) : (
              <div className="text-muted-foreground col-span-full">No events available.</div>
            )}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h1 className="text-3xl font-bold font-headline mb-6">Active Challenges</h1>
        
        {isLoadingChallenges ? (
          <div className="flex justify-center py-8">
            <LucideLoader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {challenges.length > 0 ? (
              challenges.map(challenge => (
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
              ))
            ) : (
              <div className="text-muted-foreground col-span-full">No active challenges available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}