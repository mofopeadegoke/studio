
'use client';

import { useState } from 'react';
import { users, posts } from '@/lib/data';
import { CreatePostForm } from '@/components/app/create-post-form';
import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HomePage() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const followedUserIds = currentUser.following;
  const feedPosts = posts.filter(post =>
    followedUserIds.includes(post.authorId) || post.authorId === currentUser.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredPosts = feedPosts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canPost = currentUser.type === 'Player' || currentUser.type === 'Team' || currentUser.type === 'Scout';

  return (
    <div className="max-w-2xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold font-headline">Home Feed</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {canPost && <CreatePostForm currentUser={currentUser} />}
      <div className="grid gap-6">
        {filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
