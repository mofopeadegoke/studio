'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import { BackendEvent } from '@/lib/types';
import Link from 'next/link';

export function EventCard({ event, currentUserId }: { event: BackendEvent; currentUserId: string }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsRegistered(false); 
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
        <Link
          href="https://paystack.shop/pay/-zp2fr1bn8"
          className="
            inline-flex items-center justify-center
            whitespace-nowrap rounded-md text-sm font-medium
            ring-offset-background transition-colors
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:pointer-events-none disabled:opacity-50
            h-10 px-4 py-2 w-full
            bg-primary text-primary-foreground hover:bg-primary/90
          "
        >
          Register
        </Link>
      </CardFooter>
    </Card>
  );
}
