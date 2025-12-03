'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BackendEvent } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createEvent, getAllEvents } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

const newEventInitialState = {
    title: '',
    description: '',
    date: '',
    location: '',
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState(newEventInitialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        setEvents(data.events); 
        console.log("Fetched events:", data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load events.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.location) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('date', new Date(newEvent.date).toISOString());
      formData.append('location', newEvent.location);
      if (imageFile) {
        formData.append('media', imageFile);
      }
      const createdEvent = await createEvent(formData);
      if(events.length >= 0) {
        setEvents([...events, createdEvent]);
      } else {
        setEvents([createdEvent]);
      }
      setIsAddDialogOpen(false);
      setNewEvent(newEventInitialState);
      setImagePreview(null);
      setImageFile(null);
      
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setIsAddDialogOpen(isOpen);
    if (!isOpen) {
      setNewEvent(newEventInitialState);
      setImagePreview(null);
      setImageFile(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Manage Events</CardTitle>
                <CardDescription>Add or view upcoming events.</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Event</Button>
        </CardHeader>
        <CardContent>
            {events.length > 0 ? (
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Attendees</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {events.map(event => {
                      const organizerName = event.organizer 
                        ? `${event.organizer.firstName} ${event.organizer.lastName  }` 
                        : 'Unknown';
                      
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>{format(new Date(event.date), 'PPP')}</TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>{organizerName}</TableCell>
                          <TableCell>{event.attendeesCount}</TableCell>
                        </TableRow>
                      );
                  })}
                  </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No events yet. Create your first event!
              </p>
            )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event with details and banner image.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={newEvent.title} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={newEvent.description} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="datetime-local" 
                  value={newEvent.date} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={newEvent.location} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  required
                />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Banner</Label>
                <div className="col-span-3">
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => imageInputRef.current?.click()}
                      type="button"
                    >
                      Upload Image
                    </Button>
                    {imagePreview && (
                        <div className="mt-4 relative w-full aspect-video rounded-lg overflow-hidden border">
                            <Image 
                              src={imagePreview} 
                              alt="Event banner preview" 
                              fill
                              className="object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
            <Button onClick={handleAddEvent} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}