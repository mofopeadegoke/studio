'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { use, useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Briefcase, MapPin, Search } from 'lucide-react';

import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';

import {
  getUserProfile,
  getUserPosts,
  mapBackendUserToFrontendUser,
  getAllUsersNonAdmin,
  mapBackendUserToFrontendUserWithoutUserKey,
  follow,
  unfollow,
  userFollowers,
  userFollowing,
} from '@/api/auth';

import { notFound } from 'next/navigation';
import { BackendPost, User, UserType } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { toast, useToast } from '@/hooks/use-toast';

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

function UserRow({
  targetUser,
  currentUser,
  onToggleFollow,
  initialIsFollowing, // NEW: explicitly pass the status
}: {
  targetUser: User;
  currentUser: User;
  onToggleFollow: (userId: string, isFollowing: boolean) => void;
  initialIsFollowing?: boolean;
}) {
  // Use the explicit prop if provided, otherwise fallback
  const checkFollowing = () => {
    if (initialIsFollowing !== undefined) return initialIsFollowing;
    return (currentUser?.following || []).some(id => String(id) === String(targetUser.id));
  };

  const [isFollowing, setIsFollowing] = useState(checkFollowing());

  // Keep it in sync if the parent data changes
  useEffect(() => {
    setIsFollowing(checkFollowing());
  }, [initialIsFollowing, currentUser?.following]);

  const isSelf = String(targetUser.id) === String(currentUser?.id);
  const userAvatar = PlaceHolderImages.find(img => img.id === targetUser.avatarId);

  const handleClick = async () => {
    try {
      if (isFollowing) {
        await unfollow(targetUser.id);
      } else {
        await follow(targetUser.id);
      }
      
      setIsFollowing((prev: boolean) => !prev);
      // Pass the PREVIOUS state so the parent knows what action was just taken
      onToggleFollow(targetUser.id, isFollowing); 
      
    } catch(error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: `There was an error ${isFollowing ? 'unfollowing' : 'following'} the user.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <Link href={`/profile/${targetUser.id}`} className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar>
          <AvatarImage src={userAvatar?.imageUrl} />
          <AvatarFallback>{targetUser.name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{targetUser.name}</p>
            <Badge variant={getBadgeVariant(targetUser.type)}>{targetUser.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{targetUser.bio}</p>
        </div>
      </Link>

      {!isSelf && (
        <Button
          size="sm"
          variant={isFollowing ? 'secondary' : 'default'}
          onClick={handleClick}
        >
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
  const [userFollowersUI, setUserFollowersUI] = useState<User[]>([]);
  const [userFollowingUI, setUserFollowingUI] = useState<User[]>([]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);

  const { userId } = React.use(params);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const profile = await getUserProfile();
        const mappedUser = mapBackendUserToFrontendUser(profile);

        const rawPosts = await getUserPosts(mappedUser.id);
        const normalizedPosts = Array.isArray(rawPosts)
          ? rawPosts
          : rawPosts?.posts || [];

        const usersData = await getAllUsersNonAdmin();
        const mappedUsers =
          usersData.users?.map((u: any) =>
            mapBackendUserToFrontendUserWithoutUserKey(u)
          ) || [];

        setUser(mappedUser);
        setPosts(normalizedPosts);
        setAllUsers(mappedUsers);
        setEditedBio(mappedUser.bio || '');

        if (currentUser) {
          setIsFollowingProfile(currentUser.following.includes(mappedUser.id));
        }
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    }

    async function fetchProfileData() {
      try {
        const followers = await userFollowers(userId);
        const following = await userFollowing(userId);
        setUserFollowersUI(followers.followers);
        setUserFollowingUI(following.following);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "There was an error fetching profile data.",
          variant: "destructive"
        });
      }
    }

    if (currentUser) {
      fetchData();
      fetchProfileData();
    }
  }, [currentUser, userId]);

  if (!currentUser || loading || !user) return null;

  const isSelf = user.id === currentUser.id;

  const handleSaveBio = () => {
    setUser(prev => (prev ? { ...prev, bio: editedBio } : prev));
    setIsEditDialogOpen(false);
  };

  const handleProfileFollowToggle = async () => {
    if (isFollowingProfile) {
      await unfollow(user.id);
      setUser(prev =>
        prev ? { ...prev, followers: prev.followers.filter(id => id !== currentUser.id) } : prev
      );
    } else {
      await follow(user.id);
      setUser(prev =>
        prev ? { ...prev, followers: [...prev.followers, currentUser.id] } : prev
      );
    }
    setIsFollowingProfile(prev => !prev);
  };

 const handleFollowUser = (targetId: string, wasFollowing: boolean) => {
    setUser(prev =>
      prev
        ? {
            ...prev,
            following: wasFollowing
              ? prev.following.filter(id => String(id) !== String(targetId))
              : [...prev.following, targetId],
          }
        : prev
    );

    if (wasFollowing) {
      setUserFollowingUI(prev => prev.filter(u => String(u.id) !== String(targetId)));
    } else {
      const newlyFollowedUser = allUsers.find(u => String(u.id) === String(targetId));
      if (newlyFollowedUser) {
        setUserFollowingUI(prev => [...prev, newlyFollowedUser as any]);
      }
    }
  };


const mappedFollowersList = userFollowersUI.map(u => ({
    ...mapBackendUserToFrontendUserWithoutUserKey(u)
  }));
  const followersList = mappedFollowersList;
  const mappedFollowingList = userFollowingUI.map(u => ({
    ...mapBackendUserToFrontendUserWithoutUserKey(u)
  }));

  const followingList = mappedFollowingList;

  // 2. Filter Discover section: exclude Self, Admins, AND anyone in mappedFollowingList
  const discoverableUsers = allUsers.filter(u => {
    const isNotSelf = String(u.id) !== String(currentUser.id);
    const isNotAdmin = u.type?.toLowerCase() !== 'admin' && u.name?.toLowerCase() !== 'admin';
    
    // Check if this user exists in our accurate following UI list
    const isNotAlreadyFollowed = !mappedFollowingList.some(
      (followingUser) => String(followingUser.id) === String(u.id)
    );
    
    return isNotSelf && isNotAdmin && isNotAlreadyFollowed;
  });

  // 3. Apply search query
  const searchedUsers = discoverableUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
  const userCover = PlaceHolderImages.find(img => img.id === user.profileCoverId);

  const userPosts = posts.filter(p => p.author.id === user.id);


  return (
    <div className="w-full grid gap-6">
      <Card>
        <div className="relative h-48">
          <Image src={userAvatar?.imageUrl || '/dummy/cover.jpg'} fill className="object-cover" alt="cover" />
          <Avatar className="absolute -bottom-16 left-6 h-32 w-32 border-4 border-card">
            <AvatarImage src={userAvatar?.imageUrl} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="pt-20">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.bio}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {user.type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Sports Universe
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {isSelf ? (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Update your bio</DialogDescription>
                    </DialogHeader>
                    <Textarea value={editedBio} onChange={e => setEditedBio(e.target.value)} />
                    <DialogFooter>
                      <Button onClick={handleSaveBio}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <Button
                    variant={isFollowingProfile ? 'secondary' : 'default'}
                    onClick={handleProfileFollowToggle}
                  >
                    {isFollowingProfile ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline">Message</Button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <span><b>{userFollowersUI.length}</b> Followers</span>
            <span><b>{userFollowingUI.length}</b> Following</span>
          </div>
        </CardContent>
      </Card>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4 space-y-4">
              {userPosts.length ? userPosts.map(p => <PostCard key={p.id} post={p} />) : (
                <Card><CardContent className="p-6 text-center">No posts yet.</CardContent></Card>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-4"> 
              <Card> 
                <CardContent className="p-4 sm:p-6"> 
                  <h3 className="font-bold text-base sm:text-lg font-headline mb-4"> About {user.name} </h3> 
                  <p className="text-sm sm:text-base break-words">{user.bio}</p> 
                </CardContent> 
              </Card> 
            </TabsContent>

            <TabsContent value="followers" className="mt-4 space-y-4">
              {followersList.length ? followersList.map(u => (
                <UserRow key={u.id} targetUser={u} currentUser={currentUser} onToggleFollow={handleFollowUser} />
              )) : (
                <Card><CardContent className="p-6 text-center">No followers yet.</CardContent></Card>
              )}
            </TabsContent>

           <TabsContent value="following" className="mt-4 space-y-8">
              {/* TOP SECTION: People Already Followed */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg font-headline">Following</h3>
                {mappedFollowingList.length > 0 ? (
                  <div className="space-y-4">
                    {mappedFollowingList.map(u => {
                      // If it's your own profile, you definitely follow them. 
                      // If looking at someone else's profile, check against your own following list.
                      const isCurrentlyFollowing = isSelf ? true : (currentUser.following || []).some(id => String(id) === String(u.id));
                      
                      return (
                        <UserRow 
                          key={u.id} 
                          targetUser={u} 
                          currentUser={currentUser} 
                          onToggleFollow={handleFollowUser} 
                          initialIsFollowing={isCurrentlyFollowing}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      Not following anyone yet.
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* DIVIDER */}
              <div className="border-t border-border"></div>

              {/* BOTTOM SECTION: Discover / Search */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg font-headline">Discover People</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search for new people to follow..."
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                  />
                </div>

                {searchedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {searchedUsers.map(u => (
                      <UserRow 
                        key={u.id} 
                        targetUser={u} 
                        currentUser={currentUser} 
                        onToggleFollow={handleFollowUser} 
                        initialIsFollowing={false} // By definition, they are not followed yet
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground text-sm">
                      {userSearchQuery ? 'No new users found.' : 'No more users to discover.'}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* STATS SIDEBAR */}
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
