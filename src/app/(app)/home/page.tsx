'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load initial posts
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const res = await getPosts({ page: 1 });
        if (isMounted) {
          setPosts(res.posts);
          console.log("Initial posts:", res.posts);
          setTotalPages(res.pagination.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load posts', err);
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Memoized callback for intersection observer
  const handleIntersection = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const first = entries[0];
      if (!first) return;
      
      if (first.isIntersecting && !isFetchingMore && totalPages && page < totalPages) {
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
    [page, totalPages, isFetchingMore]
  );

  // Infinite scroll intersection observer
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!bottomRef.current) return;
    if (totalPages && page >= totalPages) return;

    // Create new observer with the memoized callback
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observerRef.current.observe(bottomRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, page, totalPages]);

  if (loading || loadingInitial) return null;
  if (!currentUser) return null;

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canPost = ['Player', 'Team', 'Scout'].includes(currentUser.type);

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
        {totalPages && page < totalPages && (
          <div ref={bottomRef} className="h-10"></div>
        )}

        {isFetchingMore && (
          <div className="flex justify-center py-4">
            <span className="loader"></span>
          </div>
        )}
      </div>
    </div>
  );
}