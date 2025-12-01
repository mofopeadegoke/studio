'use client';

import { useState, useEffect, useRef } from 'react';
import { CreatePostForm } from '@/components/app/create-post-form';
import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { BackendPost } from '@/lib/types';
import { getPosts } from '@/api/auth';

export default function HomePage() {
  const { currentUser, loading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BackendPost[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Load initial posts
  useEffect(() => {
    async function fetchInitial() {
      if (!currentUser) return;

      try {
        const res = await getPosts({ page: 1 });
        setPosts(res.posts);
        setTotalPages(res.pagination.totalPages);
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    fetchInitial();
  }, [currentUser]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!bottomRef.current) return;
    if (totalPages && page >= totalPages) return; // No more posts

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingMore) {
          setIsFetchingMore(true);

          try {
            const nextPage = page + 1;
            const res = await getPosts({ page: nextPage });

            setPosts((prev) => [...prev, ...res.posts]);
            setPage(nextPage);
          } catch (err) {
            console.error('Failed to fetch more posts', err);
          } finally {
            setIsFetchingMore(false);
          }
        }
      },
      { threshold: 1 }
    );

    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [page, totalPages, isFetchingMore]);

  if (loading || loadingInitial) return null;
  if (!currentUser) return null;

  // Filter posts based on follow list
  const followedUserIds = currentUser.following;

  const feedPosts = posts
    .filter(
      (p) =>
        followedUserIds.includes(p.userId) ||
        p.userId === currentUser.id
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

  const filteredPosts = feedPosts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canPost =
    ['Player', 'Team', 'Scout'].includes(currentUser.type);

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
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Sentinel for infinite scroll */}
        <div ref={bottomRef} className="h-10"></div>

        {isFetchingMore && (
          <div className="flex justify-center py-4">
            <span className="loader"></span>
          </div>
        )}
      </div>
    </div>
  );
}
