'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Briefcase, MapPin, Plus } from 'lucide-react';

import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';

import { getUserProfile, getUserPosts, mapBackendUserToFrontendUser } from '@/api/auth';
import { notFound } from 'next/navigation';
import { BackendPost, User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [loading, setLoading] = useState(true);

  // -------- UNWRAP PARAMS (Next.js 15 requirement) --------
  const { userId } = React.use(params);

  useEffect(() => {
    async function fetchData() {
      try {
        const profile = await getUserProfile();
        const mappedUser = mapBackendUserToFrontendUser(profile);

        // Flexible backend response
        const rawPosts = await getUserPosts(currentUser?.id || '');
        const normalizedPosts =
          Array.isArray(rawPosts) ? rawPosts : rawPosts?.posts || [];

        setUser(mappedUser);

        setPosts(
          normalizedPosts.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      } catch (e) {
        console.error('Profile fetch failed', e);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) fetchData();
  }, [currentUser, userId]);

  if (!currentUser || loading) return null;
  if (!user) return null;

  const isSelf = user.id === currentUser.id;
  const isConnected = currentUser.connections?.includes(user.id);

  // Action Button Logic
  const getActionButton = () => {
    if (isSelf) return null;
    if (isConnected) return <Button variant="secondary">Connected</Button>;

    const isFanConnectingPlayer =
      currentUser.type === 'Fan' && user.type === 'Player';

    if (isFanConnectingPlayer)
      return (
        <Button>
          <Plus className="mr-2" /> Connect
        </Button>
      );

    if (currentUser.type !== 'Fan' && user.type !== 'Fan')
      return (
        <Button>
          <Plus className="mr-2" /> Connect
        </Button>
      );

    return <Button>Follow</Button>;
  };

  // -------- DUMMY IMAGES FIX --------
  const userAvatar = PlaceHolderImages.find(
    (img) => img.id === user.avatarId
  );
  const userCover = PlaceHolderImages.find(
    (img) => img.id === user.profileCoverId
  );

  const avatarUrl = userAvatar?.imageUrl || '/dummy/avatar.png';
  const coverUrl = userCover?.imageUrl || '/dummy/cover.jpg';

  const userPosts = posts.filter((p) => p.author.id === user.id);

  return (
    <div className="grid gap-6">
      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Cover */}
          <div className="h-48 bg-muted relative">
            <Image
              src={coverUrl}
              alt="cover"
              fill
              className="object-cover"
            />
          </div>

          {/* Avatar */}
          <div className="absolute top-24 left-6">
            <Avatar className="h-32 w-32 border-4 border-card">
              <AvatarImage src={avatarUrl} alt={user.name} />
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
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {user.type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Sports Universe
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {getActionButton()}
              {!isSelf && <Button variant="outline">Message</Button>}
            </div>
          </div>

          {/* Connections */}
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="#" className="hover:underline">
              <span className="font-bold">{user.connections.length}</span> Connections
            </Link>

            <Link href="#" className="hover:underline">
              <span className="font-bold">{user.followers.length}</span> Followers
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            {/* Posts */}
            <TabsContent value="posts" className="mt-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No posts yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* About */}
            <TabsContent value="about" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg font-headline mb-4">
                    About {user.name}
                  </h3>
                  <p>{user.bio}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connections */}
            <TabsContent value="connections" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg font-headline mb-4">
                    Connections
                  </h3>
                  <p className="text-muted-foreground">
                    List of connections would appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {user.stats && (
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {Object.entries(user.stats).map(([k, v]) => (
                    <li key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span>{v}</span>
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
