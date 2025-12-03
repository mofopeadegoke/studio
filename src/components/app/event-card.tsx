'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import { BackendEvent } from '@/lib/types';

export function EventCard({ event, currentUserId }: { event: BackendEvent; currentUserId: string }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsRegistered(event.attendees.some(att => att.id === currentUserId)); 
  }, [event.attendees, currentUserId]);


  if (!isClient) {  
    return (
        <Card className="flex flex-col">
            <div className="w-full h-40 bg-muted animate-pulse"></div>
            <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
            </CardContent>
            <CardFooter>
                 <div className="h-10 w-full bg-muted animate-pulse rounded"></div> 
            </CardFooter>
        </Card>
    );
  }

  const handleRegister = () => {
    setIsRegistered(!isRegistered);
  };

  return (
    <Card className="flex flex-col">
      <div className="relative w-full h-40">
        {event.media[0] && (
          <Image
            src={event.media[0].url}
            alt={event.title}
            fill
            className="object-cover rounded-t-lg"
          />
        )}
      </div>
      <CardHeader>
        <CardTitle className="font-headline">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.date), 'EEE, MMM d, yyyy @ h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleRegister} variant={isRegistered ? 'secondary' : 'default'}>
          {isRegistered ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Registered
            </>
          ) : (
            'Register'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
