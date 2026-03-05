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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LucideLoader } from 'lucide-react';

// Import your API functions (adjust paths as needed based on your structure)
import { getAllPosts, getAllChallenges } from '@/api/auth';
import { BackendPost, Challenge } from '@/lib/types';

type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  score: number;
};

export default function AdminLeaderboardPage() {
  const { toast } = useToast();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAndComputeLeaderboard() {
      setIsLoading(true);
      try {
        const [challengesData, postsData] = await Promise.all([
          getAllChallenges(),
          getAllPosts()
        ]);

        const fetchedChallenges: Challenge[] = challengesData.challenges || [];
        const allPosts: BackendPost[] = postsData.posts || [];

        setChallenges(fetchedChallenges);
        const computedLeaderboard: Record<string, LeaderboardEntry[]> = {};

        fetchedChallenges.forEach(challenge => {
          const userScores: Record<string, { userName: string, score: number }> = {};
          const hashtagToMatch = challenge.hashtag?.toLowerCase() || '';
          allPosts.forEach(post => {
            const content = post.content?.toLowerCase() || '';
            
            if (hashtagToMatch && content.includes(hashtagToMatch)) {
              const author = post.author;
              if (!author) return;
              
              const userId = author.id;
              const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Unknown User';

              if (!userScores[userId]) {
                userScores[userId] = { userName: authorName, score: 0 };
              }
            
              userScores[userId].score += (post.likesCount || 0);
            }
          });
          const sortedRankings = Object.entries(userScores)
            .map(([userId, data]) => ({
              userId,
              userName: data.userName,
              score: data.score
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
              ...entry,
              rank: index + 1
            }));

          computedLeaderboard[challenge.id] = sortedRankings;
        });

        setLeaderboardData(computedLeaderboard);

      } catch (error) {
        console.error("Error computing leaderboard:", error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndComputeLeaderboard();
  }, [toast]);

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Challenge Leaderboards</CardTitle>
                <CardDescription>Live rankings based on total post likes for each challenge hashtag.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LucideLoader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : challenges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active challenges found.
                  </div>
                ) : (
                  <Tabs defaultValue={challenges[0]?.id} className="w-full">
                      <TabsList className="inline-flex flex-wrap justify-start h-auto w-auto max-w-full mb-2">
                      {challenges.map(challenge => (
                          <TabsTrigger key={challenge.id} value={challenge.id}>
                            {challenge.title}
                          </TabsTrigger>
                      ))}
                    </TabsList>
                      
                      {challenges.map(challenge => {
                        const entries = leaderboardData[challenge.id] || [];
                        
                        return (
                          <TabsContent key={challenge.id} value={challenge.id} className="mt-6">
                              {entries.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg bg-muted/20 text-muted-foreground">
                                  No participants yet for <span className="font-mono">{challenge.hashtag}</span>.
                                </div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                      <TableRow>
                                      <TableHead className="w-[80px]">Rank</TableHead>
                                      <TableHead>User</TableHead>
                                      <TableHead className="text-right w-[150px]">Total Likes</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {entries.map(entry => (
                                          <TableRow key={entry.userId}>
                                            <TableCell className="font-medium text-lg">
                                              {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : entry.rank}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{entry.userName}</span>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-lg">
                                                {entry.score}
                                            </TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              )}
                          </TabsContent>
                        );
                      })}
                  </Tabs>
                )}
            </CardContent>
        </Card>
    </div>
  );
}