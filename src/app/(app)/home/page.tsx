'use client';

import { users, posts } from '@/lib/data';
import { CreatePostForm } from '@/components/app/create-post-form';
import { PostCard } from '@/components/app/post-card';
import { useAuth } from '@/context/auth-context';

export default function HomePage() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const followedUserIds = currentUser.following;
  const feedPosts = posts.filter(post =>
    followedUserIds.includes(post.authorId) || post.authorId === currentUser.id
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const canPost = currentUser.type === 'Player' || currentUser.type === 'Team' || currentUser.type === 'Scout';

  return (
    <div className="max-w-2xl mx-auto grid gap-6">
      <h1 className="text-2xl font-bold font-headline">Home Feed</h1>
      {canPost && <CreatePostForm currentUser={currentUser} />}
      <div className="grid gap-6">
        {feedPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
