import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { users } from '@/lib/data';
import type { Post } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MessageCircle, Heart, Repeat2, Send } from 'lucide-react';

export function PostCard({ post }: { post: Post }) {
  const author = users.find(user => user.id === post.authorId);
  if (!author) return null;

  const authorAvatar = PlaceHolderImages.find(img => img.id === author.avatarId);
  const postImage = post.imageId ? PlaceHolderImages.find(img => img.id === post.imageId) : null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={authorAvatar?.imageUrl} alt={author.name} data-ai-hint={authorAvatar?.imageHint} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 text-sm">
            <Link href={`/profile/${author.id}`} className="font-bold hover:underline font-headline">
              {author.name}
            </Link>
            <div className="text-muted-foreground">@{author.name.toLowerCase().replace(' ', '')} · {timeAgo}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {postImage && (
          <div className="mt-4 -mx-4">
            <Image
              src={postImage.imageUrl}
              alt="Post image"
              width={800}
              height={600}
              data-ai-hint={postImage.imageHint}
              className="w-full object-cover aspect-video"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="ghost" size="sm">
          <Heart className="mr-2" /> {post.likes}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageCircle className="mr-2" /> {post.comments.length}
        </Button>
        <Button variant="ghost" size="sm">
          <Repeat2 className="mr-2" /> Repost
        </Button>
        <Button variant="ghost" size="sm">
          <Send className="mr-2" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
}
