import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Repeat2, Send } from "lucide-react";
import type { BackendPost } from "@/lib/types";
import {users as dummyUsers} from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function PostCard({ post }: { post: BackendPost }) {
  const author = post.author;
  if (!author) return null;

  const fullName = `${author.firstName} ${author.lastName}`;
  
    const dummyUser = dummyUsers[0];
  const dummyAvatar = dummyUser
    ? PlaceHolderImages.find(img => img.id === dummyUser.avatarId)
    : PlaceHolderImages[0]; // absolute fallback
  const avatarUrl = author.profilePicture || dummyAvatar?.imageUrl;
  const postImage = post.media?.[0]?.url || null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>{author.firstName[0]}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 text-sm">
            <Link
              href={`/profile/${author.id}`}
              className="font-bold hover:underline font-headline"
            >
              {fullName}
            </Link>
            <div className="text-muted-foreground">
              @{author.firstName.toLowerCase()}
              · {timeAgo}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>

        {postImage && (
          <div className="mt-4 -mx-4">
            <Image
              src={postImage}
              alt="Post media"
              width={800}
              height={600}
              className="w-full object-cover aspect-video"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="ghost" size="sm">
          <Heart className="mr-2" /> {post.likesCount}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageCircle className="mr-2" /> {post.commentsCount}
        </Button>
        <Button variant="ghost" size="sm">
          <Repeat2 className="mr-2" /> {post.sharesCount}
        </Button>
        <Button variant="ghost" size="sm">
          <Send className="mr-2" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
}
