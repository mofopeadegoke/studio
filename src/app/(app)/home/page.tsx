'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from '@/components/app/create-post-form';
import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import axios from 'axios';
import type { BackendPost } from '@/lib/types';
import { getPosts } from '@/api/auth';

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch backend posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await getPosts();
        setPosts(res.posts);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoadingPosts(false);
      }
    }

    if (currentUser) fetchPosts();
  }, [currentUser]);

  if (loading || loadingPosts) return null;
  if (!currentUser) return null;

  // Build feed: show posts by followed users or self
  const followedUserIds = currentUser.following;

  const feedPosts = posts
    .filter(
      p =>
        followedUserIds.includes(p.userId) ||
        p.userId === currentUser.id
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canPost =
    ["Player", "Team", "Scout"].includes(currentUser.type);

  return (
    <div className="max-w-2xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold font-headline">Home Feed</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
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
