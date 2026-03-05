'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';

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

import { Briefcase, MapPin, Search, Camera } from 'lucide-react';

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
  updateProfile
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
  initialIsFollowing, 
}: {
  targetUser: User;
  currentUser: User;
  onToggleFollow: (userId: string, isFollowing: boolean) => void;
  initialIsFollowing?: boolean;
}) {
  const checkFollowing = () => {
    if (initialIsFollowing !== undefined) return initialIsFollowing;
    return (currentUser?.following || []).some(id => String(id) === String(targetUser.id));
  };

  const [isFollowing, setIsFollowing] = useState(checkFollowing());

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
          <AvatarImage src={targetUser.profilePicture || userAvatar?.imageUrl} />
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

  // --- EDIT PROFILE STATE ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        // Initialize edit form values
        setEditedBio(mappedUser.bio || '');
        const nameParts = mappedUser.name?.split(' ') || [];
        setEditedFirstName(nameParts[0] || '');
        setEditedLastName(nameParts.slice(1).join(' ') || '');

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
      }
    }

    if (currentUser) {
      fetchData();
      fetchProfileData();
    }
  }, [currentUser, userId]);

  if (!currentUser || loading || !user) return null;

  const isSelf = user.id === currentUser.id;

  // --- HANDLE EDIT PROFILE ---
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('firstName', editedFirstName.trim());
      formData.append('lastName', editedLastName.trim());
      formData.append('bio', editedBio.trim());
      
      if (profilePicFile) {
        formData.append('profilePicture', profilePicFile);
      }
      const response = await updateProfile(formData);

      const updatedUser = response?.user || response;
      const newName = `${editedFirstName.trim()} ${editedLastName.trim()}`.trim();

      setUser(prev => prev ? { 
        ...prev, 
        name: updatedUser?.name || newName,
        firstName: updatedUser?.firstName || editedFirstName,
        lastName: updatedUser?.lastName || editedLastName,
        bio: updatedUser?.bio || editedBio,
        profilePicture: updatedUser?.profilePicture || profilePicPreview || prev.profilePicture
      } : prev);

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setIsEditDialogOpen(false);
      setProfilePicFile(null);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

  const discoverableUsers = allUsers.filter(u => {
    const isNotSelf = String(u.id) !== String(currentUser.id);
    const isNotAdmin = u.type?.toLowerCase() !== 'admin' && u.name?.toLowerCase() !== 'admin';
    const isNotAlreadyFollowed = !mappedFollowingList.some(
      (followingUser) => String(followingUser.id) === String(u.id)
    );
    return isNotSelf && isNotAdmin && isNotAlreadyFollowed;
  });

  const searchedUsers = discoverableUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  
  // Resolve Avatar and Cover Image sources
  const userAvatar = PlaceHolderImages.find(img => img.id === user.avatarId);
  
  // Use uploaded picture first, then fallback to placeholder
  const displayAvatar = user.profilePicture || userAvatar?.imageUrl;

  const userPosts = posts.filter(p => p.author.id === user.id);

  return (
    <div className="w-full grid gap-6">
      <Card>
        <div className="relative h-48">
          <Image src={displayAvatar || '/dummy/cover.jpg'} fill className="object-cover opacity-80" alt="cover" />
          <Avatar className="absolute -bottom-16 left-6 h-32 w-32 border-4 border-card">
            <AvatarImage src={displayAvatar} />
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
                <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
                  setIsEditDialogOpen(isOpen);
                  if (!isOpen) setProfilePicPreview(null); // Clear preview if closed without saving
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Update your personal information and avatar.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                      {/* Avatar Upload Section */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-2">
                            <AvatarImage src={profilePicPreview || displayAvatar} />
                            <AvatarFallback>{editedFirstName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Button 
                            size="icon" 
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleProfilePicChange} 
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Click the camera to upload a new picture</p>
                      </div>

                      {/* Text Fields Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input value={editedFirstName} onChange={e => setEditedFirstName(e.target.value)} placeholder="First Name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input value={editedLastName} onChange={e => setEditedLastName(e.target.value)} placeholder="Last Name" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea 
                          value={editedBio} 
                          onChange={e => setEditedBio(e.target.value)} 
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
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
                        initialIsFollowing={false} 
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