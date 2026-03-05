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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { LucideLoader } from 'lucide-react';

// Use getPosts instead of the admin-only getAllPosts
import { getPosts, getAllChallenges } from '@/api/auth';
import { BackendPost, Challenge } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  profilePicture: string | null;
};

export default function LeaderboardPage() {
  const { toast } = useToast();
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- NEW: Helper function to fetch paginated posts ---
    async function fetchAllAvailablePosts(): Promise<BackendPost[]> {
      let aggregatedPosts: BackendPost[] = [];
      try {
        // 1. Fetch the first page to get the data and pagination info
        const firstPageData = await getPosts({ page: 1 });
        aggregatedPosts = [...(firstPageData.posts || [])];
        
        // Check how many pages exist. Assuming your API returns a pagination object like the Home Feed
        const totalPages = firstPageData.pagination?.totalPages || 1;
        
        // 2. SAFETY LIMIT: Let's only fetch up to 10 pages max to prevent browser crashes.
        // If you want it to fetch EVERYTHING, remove the Math.min, but be warned!
        const pagesToFetch = Math.min(totalPages, 10); 

        // 3. Fetch the remaining pages in parallel for speed
        if (pagesToFetch > 1) {
          const pagePromises = [];
          for (let i = 2; i <= pagesToFetch; i++) {
            pagePromises.push(getPosts({ page: i }));
          }
          
          const remainingPages = await Promise.all(pagePromises);
          
          remainingPages.forEach(pageData => {
            aggregatedPosts = [...aggregatedPosts, ...(pageData.posts || [])];
          });
        }
      } catch (error) {
        console.error("Error fetching paginated posts:", error);
      }
      
      return aggregatedPosts;
    }

    async function fetchAndComputeLeaderboard() {
      setIsLoading(true);
      try {
        // Fetch challenges and our newly aggregated posts concurrently
        const [challengesData, allPosts] = await Promise.all([
          getAllChallenges(),
          fetchAllAvailablePosts() 
        ]);

        const fetchedChallenges: Challenge[] = challengesData.challenges || [];
        setChallenges(fetchedChallenges);

        // Compute rankings per challenge
        const computedLeaderboard: Record<string, LeaderboardEntry[]> = {};

        fetchedChallenges.forEach(challenge => {
          const userScores: Record<string, { userName: string, score: number, profilePicture: string | null }> = {};
          const hashtagToMatch = challenge.hashtag?.toLowerCase() || '';

          allPosts.forEach(post => {
            const content = post.content?.toLowerCase() || '';
            
            if (hashtagToMatch && content.includes(hashtagToMatch)) {
              const author = post.author;
              if (!author) return;
              
              const userId = author.id;
              const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Unknown User';

              if (!userScores[userId]) {
                userScores[userId] = { 
                  userName: authorName, 
                  score: 0,
                  profilePicture: author.profilePicture || null
                };
              }
              
              userScores[userId].score += (post.likesCount || 0);
            }
          });

          const sortedRankings = Object.entries(userScores)
            .map(([userId, data]) => ({
              userId,
              userName: data.userName,
              score: data.score,
              profilePicture: data.profilePicture
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
      <h1 className="text-3xl font-bold font-headline">Leaderboards</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LucideLoader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-muted-foreground">
          No active challenges found. Check back later!
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
              <TabsContent key={challenge.id} value={challenge.id} className="mt-4">
                {entries.length === 0 ? (
                  <div className="py-8 text-muted-foreground">
                    No one has participated in <span className="font-mono bg-muted px-1 py-0.5 rounded">{challenge.hashtag}</span> yet. Be the first!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Total Likes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map(entry => (
                        <TableRow key={entry.userId}>
                          <TableCell className="font-medium text-lg">
                            {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : entry.rank}
                          </TableCell>
                          <TableCell>
                            <p className="flex items-center gap-3 hover:underline font-semibold text-lg">
                                <Avatar>
                                    <AvatarImage src={entry.profilePicture || undefined} alt={entry.userName} />
                                    <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{entry.userName}</span>
                            </p>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-lg">
                            {entry.score.toLocaleString()}
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
    </div>
  );
}