import Image from 'next/image';
import Link from 'next/link';
import { users, posts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/app/post-card';
import { notFound } from 'next/navigation';
import { Briefcase, MapPin, Plus } from 'lucide-react';

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const user = users.find(u => u.id === params.userId);
  const currentUser = users.find(u => u.id === '1'); // Simulated logged in user

  if (!user || !currentUser) {
    notFound();
  }

  const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
  const userCover = user.profileCoverId ? PlaceHolderImages.find(img => img.id === user.profileCoverId) : null;
  const userPosts = posts.filter(p => p.authorId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const isSelf = user.id === currentUser.id;
  const isConnected = currentUser.connections.includes(user.id);

  const getActionButton = () => {
    if (isSelf) return null;
    if (isConnected) {
      return <Button variant="secondary">Connected</Button>;
    }
    if (currentUser.type === 'Fan' && user.type === 'Player') {
      return <Button><Plus className="mr-2" />Connect</Button>;
    }
    if (currentUser.type !== 'Fan' && user.type !== 'Fan') {
        return <Button><Plus className="mr-2" />Connect</Button>;
    }
    return <Button>Follow</Button>;
  };

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <div className="relative">
          <div className="h-48 bg-muted">
            {userCover && (
              <Image
                src={userCover.imageUrl}
                alt={`${user.name}'s cover photo`}
                fill
                className="object-cover"
                data-ai-hint={userCover.imageHint}
              />
            )}
          </div>
          <div className="absolute top-24 left-6">
            <Avatar className="h-32 w-32 border-4 border-card">
              <AvatarImage src={userAvatar?.imageUrl} alt={user.name} data-ai-hint={userAvatar?.imageHint} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-20 px-6 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-headline">{user.name}</h1>
              <p className="text-muted-foreground">{user.bio}</p>
              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/>{user.type}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/>Sports Universe</span>
              </div>
            </div>
            <div className="flex gap-2">
              {getActionButton()}
              {!isSelf && <Button variant="outline">Message</Button>}
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="#" className="hover:underline"><span className="font-bold">{user.connections.length}</span> Connections</Link>
            <Link href="#" className="hover:underline"><span className="font-bold">{user.followers.length}</span> Followers</Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Tabs defaultValue="posts" className="w-full">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="grid gap-6 mt-4">
              {userPosts.length > 0 ? userPosts.map(post => <PostCard key={post.id} post={post} />) : <Card><CardContent className="p-6 text-center text-muted-foreground">No posts yet.</CardContent></Card>}
            </TabsContent>
            <TabsContent value="about" className="mt-4">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg font-headline mb-4">About {user.name}</h3>
                        <p>{user.bio}</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="connections" className="mt-4">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-lg font-headline mb-4">Connections</h3>
                        <p className="text-muted-foreground">List of connections would appear here.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
            {user.stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {Object.entries(user.stats).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="text-muted-foreground">{key}</span>
                                    <span className="font-medium">{value}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
