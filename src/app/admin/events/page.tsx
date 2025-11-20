
'use client'

import { useState } from 'react';
import { events as initialEvents } from '@/lib/data';
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
import { Event } from '@/lib/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const newEventInitialState: Omit<Event, 'id' | 'registeredUsers'> = {
    title: '',
    description: '',
    date: '',
    location: '',
    bannerId: PlaceHolderImages[0].id
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState(newEventInitialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };
  
  const handleSelectChange = (value: string) => {
    setNewEvent({ ...newEvent, bannerId: value });
  };

  const handleAddEvent = () => {
    const eventToAdd: Event = {
        ...newEvent,
        id: `e${events.length + 1}`,
        date: new Date(newEvent.date).toISOString(),
        registeredUsers: []
    }
    setEvents([...events, eventToAdd]);
    setIsAddDialogOpen(false);
    setNewEvent(newEventInitialState);
  };
  
  const eventImages = PlaceHolderImages.filter(img => img.id.startsWith('event-'));

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
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registered Users</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {events.map(event => (
                    <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{format(new Date(event.date), 'PPP')}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.registeredUsers.length}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={newEvent.title} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={newEvent.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" name="date" type="datetime-local" value={newEvent.date} onChange={handleInputChange} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" name="location" value={newEvent.location} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bannerId" className="text-right">Banner</Label>
                <Select name="bannerId" onValueChange={handleSelectChange} defaultValue={newEvent.bannerId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a banner" />
                    </SelectTrigger>
                    <SelectContent>
                        {eventImages.map(img => (
                            <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
