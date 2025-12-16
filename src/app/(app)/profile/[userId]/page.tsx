'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Briefcase, MapPin, Plus, Search } from 'lucide-react';

import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';

import { getUserProfile, getUserPosts, mapBackendUserToFrontendUser, getAllUsersNonAdmin, mapBackendUserToFrontendUserWithoutUserKey } from '@/api/auth';
import { notFound } from 'next/navigation';
import { BackendPost, User, UserType } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function getBadgeVariant(userType: UserType): 'fan' | 'player' | 'pro' | 'secondary' {
  switch (userType) {
    case 'Fan':
      return 'fan';
    case 'Player':
      return 'player';
    case 'Scout':
    case 'Team':
      return 'pro';
    default:
      return 'secondary';
  }
}

function UserRow({ targetUser, currentUser }: { targetUser: User, currentUser: User }) {
  const [isFollowing, setIsFollowing] = useState(currentUser.following.includes(targetUser.id));
  const userAvatar = PlaceHolderImages.find(img => img.id === targetUser.avatarId);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Make API call to update following status
  };

  const isSelf = targetUser.id === currentUser.id;

  return (
    <div className="flex items-center justify-between gap-3">
      <Link href={`/profile/${targetUser.id}`} className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="flex-shrink-0">
          <AvatarImage src={userAvatar?.imageUrl} alt={targetUser.name} data-ai-hint={userAvatar?.imageHint} />
          <AvatarFallback>{targetUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold hover:underline truncate">{targetUser.name}</p>
            <Badge variant={getBadgeVariant(targetUser.type)}>{targetUser.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{targetUser.bio}</p>
        </div>
      </Link>
      {!isSelf && (
        <Button onClick={handleFollowToggle} variant={isFollowing ? 'secondary' : 'default'} size="sm" className="flex-shrink-0">
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  // Unwrap params (Next.js 15 requirement)
  const { userId } = React.use(params);

  useEffect(() => {
    async function fetchData() {
      try {
        const profile = await getUserProfile();
        const mappedUser = mapBackendUserToFrontendUser(profile);

        // Fetch user posts
        const rawPosts = await getUserPosts(mappedUser.id);
        const normalizedPosts = Array.isArray(rawPosts) ? rawPosts : rawPosts?.posts || [];

        // Fetch all users for followers/following lists
        const usersData = await getAllUsersNonAdmin();
        const mappedUsers = usersData.users?.map((u: any) => mapBackendUserToFrontendUserWithoutUserKey(u)) || [];

        setUser(mappedUser);
        setPosts(
          normalizedPosts.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        setAllUsers(mappedUsers);
        setEditedBio(mappedUser.bio || '');
        
        if (currentUser) {
          setIsFollowing(currentUser.following.includes(mappedUser.id));
        }
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

  // Get followers and following lists
  const followersList = allUsers.filter(u => user.followers.includes(u.id));
  const followingList = allUsers.filter(u => user.following.includes(u.id));

  // Search functionality
  const searchedUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  const followingListToDisplay = userSearchQuery ? searchedUsers : followingList;

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // TODO: Make API call to update following status
  };

  const handleSaveBio = () => {
    setUser(prevUser => prevUser ? { ...prevUser, bio: editedBio } : null);
    setIsEditDialogOpen(false);
    // TODO: Make API call to update bio
  };

  // Action Button Logic
  const getActionButton = () => {
    if (isSelf) {
      return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Profile</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={editedBio} 
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveBio}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Button onClick={handleFollowToggle} variant={isFollowing ? 'secondary' : 'default'}>
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    );
  };

  // Get avatar and cover images
  const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
  const userCover = PlaceHolderImages.find(img => img.id === user.profileCoverId);
  const avatarUrl = userAvatar?.imageUrl || '/dummy/avatar.png';
  const coverUrl = userCover?.imageUrl || '/dummy/cover.jpg';

  const userPosts = posts.filter((p) => p.author.id === user.id);

  return (
    <div className="w-full grid gap-4 sm:gap-6 px-2 sm:px-4 md:px-0">
      {/* Profile Card */}
      <Card className="overflow-hidden w-full">
        <div className="relative">
          {/* Cover */}
          <div className="h-32 sm:h-48 bg-muted relative">
            <Image
              src={avatarUrl}
              alt="cover"
              fill
              className="object-cover"
              data-ai-hint={userCover?.imageHint}
            />
          </div>

          {/* Avatar */}
          <div className="absolute top-16 sm:top-24 left-4 sm:left-6">
            <Avatar className="h-20 w-20 sm:h-32 sm:w-32 border-4 border-card">
              <AvatarImage src={avatarUrl} alt={user.name} data-ai-hint={userAvatar?.imageHint} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="pt-12 sm:pt-20 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold font-headline break-words">{user.name}</h1>
              <p className="text-muted-foreground text-sm sm:text-base break-words">{user.bio}</p>

              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                  {user.type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  Sports Universe
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {getActionButton()}
              {!isSelf && <Button variant="outline" className="flex-1 sm:flex-none">Message</Button>}
            </div>
          </div>

          {/* Connections */}
          <div className="mt-4 flex gap-4 text-xs sm:text-sm">
            <span className="hover:underline cursor-pointer">
              <span className="font-bold">{user.followers.length}</span> Followers
            </span>
            <span className="hover:underline cursor-pointer">
              <span className="font-bold">{user.following.length}</span> Following
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="posts" className="text-xs sm:text-sm">Posts</TabsTrigger>
              <TabsTrigger value="about" className="text-xs sm:text-sm">About</TabsTrigger>
              <TabsTrigger value="followers" className="text-xs sm:text-sm">Followers</TabsTrigger>
              <TabsTrigger value="following" className="text-xs sm:text-sm">Following</TabsTrigger>
            </TabsList>

            {/* Posts */}
            <TabsContent value="posts" className="grid gap-4 sm:gap-6 mt-4">
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
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg font-headline mb-4">
                    About {user.name}
                  </h3>
                  <p className="text-sm sm:text-base break-words">{user.bio}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Followers */}
            <TabsContent value="followers" className="mt-4">
              <Card>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {followersList.length > 0 ? (
                    followersList.map(follower => (
                      <UserRow key={follower.id} targetUser={follower} currentUser={currentUser} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center text-sm">No followers yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Following */}
            <TabsContent value="following" className="mt-4">
              <Card>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search for users to follow..."
                      className="pl-10 w-full"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    {followingListToDisplay.length > 0 ? (
                      followingListToDisplay.map(followedUser => (
                        <UserRow key={followedUser.id} targetUser={followedUser} currentUser={currentUser} />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center text-sm">
                        {userSearchQuery ? 'No users found.' : 'Not following anyone yet.'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {user.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-base sm:text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {Object.entries(user.stats).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-2">
                      <span className="text-muted-foreground truncate">{k}</span>
                      <span className="font-medium flex-shrink-0">{v}</span>
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