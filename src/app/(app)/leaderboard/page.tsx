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
import { leaderboardData, users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function LeaderboardPage() {
  const challenges = Object.keys(leaderboardData);

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold font-headline">Leaderboards</h1>
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
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData[challenge].map(entry => {
                  const user = users.find(u => u.id === entry.userId);
                  if (!user) return null;
                  const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);

                  return (
                    <TableRow key={entry.userId}>
                      <TableCell className="font-medium text-lg">{entry.rank}</TableCell>
                      <TableCell>
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 hover:underline">
                            <Avatar>
                                <AvatarImage src={userAvatar?.imageUrl} alt={user.name} data-ai-hint={userAvatar?.imageHint} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-mono">{entry.score.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
