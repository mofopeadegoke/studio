
'use client'

import { useState } from 'react';
import { leaderboardData as initialLeaderboardData, users } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState(initialLeaderboardData);

  const handleScoreChange = (category: string, userId: string, newScore: number) => {
    const updatedCategory = leaderboardData[category].map(entry => 
      entry.userId === userId ? { ...entry, score: newScore } : entry
    ).sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));

    setLeaderboardData({
      ...leaderboardData,
      [category]: updatedCategory,
    });
  };

  const challenges = Object.keys(leaderboardData);

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Manage Leaderboard</CardTitle>
                <CardDescription>Update scores for each leaderboard category.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={challenges[0]} className="w-full">
                    <TabsList>
                    {challenges.map(challenge => (
                        <TabsTrigger key={challenge} value={challenge}>
                        {challenge}
                        </TabsTrigger>
                    ))}
                    </TabsList>
                    {challenges.map(challenge => (
                    <TabsContent key={challenge} value={challenge}>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right w-[150px]">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboardData[challenge].map(entry => {
                            const user = users.find(u => u.id === entry.userId);
                            if (!user) return null;
                            
                            return (
                                <TableRow key={entry.userId}>
                                <TableCell className="font-medium text-lg">{entry.rank}</TableCell>
                                <TableCell>
                                    <span className="font-medium">{user.name}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Input 
                                        type="number"
                                        defaultValue={entry.score}
                                        onBlur={(e) => handleScoreChange(challenge, entry.userId, parseInt(e.target.value))}
                                        className="w-24 float-right"
                                    />
                                </TableCell>
                                </TableRow>
                            );
                            })}
                        </TableBody>
                        </Table>
                    </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
