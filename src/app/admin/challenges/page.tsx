'use client'

import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Challenge } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'; // Assuming you are using shadcn's toast
import { LucideLoader } from 'lucide-react';
import { getAllChallenges, createChallenge } from '@/api/auth'; 

const newChallengeInitialState = {
    title: '',
    description: '',
    hashtag: '',
    startDate: '',
    endDate: '', 
}

export default function AdminChallengesPage() {
  const { toast } = useToast();
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState(newChallengeInitialState);

  // Fetch challenges on component mount
  useEffect(() => {
    async function fetchChallenges() {
      setIsLoading(true);
      try {
        const data = await getAllChallenges();
        setChallenges(data.challenges || []);
      } catch (error) {
        console.error("Error fetching challenges:", error);
        toast({
          title: "Error",
          description: "Failed to load challenges.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenges();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewChallenge({ ...newChallenge, [name]: value });
  };

  const handleAddChallenge = async () => {
    // Basic validation
    if (!newChallenge.title || !newChallenge.description || !newChallenge.hashtag || !newChallenge.startDate || !newChallenge.endDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields, including dates.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', newChallenge.title);
      formData.append('description', newChallenge.description);
      
      const formattedHashtag = newChallenge.hashtag.startsWith('#') 
        ? newChallenge.hashtag 
        : `#${newChallenge.hashtag}`;
      formData.append('hashtag', formattedHashtag);

      // Convert the HTML date string to a valid ISO Timestamp for the database
      formData.append('startDate', new Date(newChallenge.startDate).toISOString());
      formData.append('endDate', new Date(newChallenge.endDate).toISOString());

      const response = await createChallenge(formData);
      const createdChallenge = response.challenge || response; 
      
      setChallenges((prev) => [createdChallenge, ...prev]);
      
      setIsAddDialogOpen(false);
      setNewChallenge(newChallengeInitialState);
      
      toast({
        title: "Success",
        description: "Challenge created successfully.",
      });
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast({
        title: "Error",
        description: "Failed to create the challenge.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Manage Challenges</CardTitle>
                <CardDescription>Add or view active challenges.</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Challenge</Button>
        </CardHeader>
        <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LucideLoader className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hashtag</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {challenges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No challenges found. Create one!
                      </TableCell>
                    </TableRow>
                  ) : (
                    challenges.map(challenge => (
                        <TableRow key={challenge.id}>
                            <TableCell className="font-medium">{challenge.title}</TableCell>
                            <TableCell className="max-w-md truncate">{challenge.description}</TableCell>
                            <TableCell><span className="font-mono bg-muted px-2 py-1 rounded text-sm">{challenge.hashtag}</span></TableCell>
                        </TableRow>
                    ))
                  )}
                  </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
          setIsAddDialogOpen(isOpen);
          if (!isOpen) {
              setNewChallenge(newChallengeInitialState);
          }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Challenge</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" value={newChallenge.title} onChange={handleInputChange} className="col-span-3" disabled={isCreating} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={newChallenge.description} onChange={handleInputChange} className="col-span-3" disabled={isCreating} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hashtag" className="text-right">Hashtag</Label>
                <Input id="hashtag" name="hashtag" placeholder="#YourHashtag" value={newChallenge.hashtag} onChange={handleInputChange} className="col-span-3" disabled={isCreating} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="datetime-local" // Or "date" if you don't need time
                  value={newChallenge.startDate} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  disabled={isCreating} 
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">End Date</Label>
                <Input 
                  id="endDate" 
                  name="endDate" 
                  type="datetime-local" // Or "date"
                  value={newChallenge.endDate} 
                  onChange={handleInputChange} 
                  className="col-span-3" 
                  disabled={isCreating} 
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isCreating}>Cancel</Button>
            <Button onClick={handleAddChallenge} disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Challenge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}