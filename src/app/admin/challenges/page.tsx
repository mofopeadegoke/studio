
'use client'

import { useState } from 'react';
import { challenges as initialChallenges } from '@/lib/data';
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

const newChallengeInitialState: Omit<Challenge, 'id'> = {
    title: '',
    description: '',
    hashtag: '',
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState(newChallengeInitialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewChallenge({ ...newChallenge, [name]: value });
  };

  const handleAddChallenge = () => {
    const challengeToAdd: Challenge = {
        ...newChallenge,
        id: `challenge-${challenges.length + 1}`,
        hashtag: newChallenge.hashtag.startsWith('#') ? newChallenge.hashtag : `#${newChallenge.hashtag}`
    }
    setChallenges([...challenges, challengeToAdd]);
    setIsAddDialogOpen(false);
    setNewChallenge(newChallengeInitialState);
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
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hashtag</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {challenges.map(challenge => (
                    <TableRow key={challenge.id}>
                        <TableCell className="font-medium">{challenge.title}</TableCell>
                        <TableCell className="max-w-md">{challenge.description}</TableCell>
                        <TableCell><span className="font-mono bg-muted px-2 py-1 rounded">{challenge.hashtag}</span></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
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
                <Input id="title" name="title" value={newChallenge.title} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={newChallenge.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hashtag" className="text-right">Hashtag</Label>
                <Input id="hashtag" name="hashtag" placeholder="#YourHashtag" value={newChallenge.hashtag} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddChallenge}>Add Challenge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
