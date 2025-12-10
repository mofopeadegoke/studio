'use client';

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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Heart, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import type { BackendPost, Comment } from "@/lib/types";
import { users as dummyUsers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getComments, addComment, likePost, checkIfPostIsLiked } from '@/api/auth';
import { useToast } from "@/hooks/use-toast";

// Transform backend comment format to frontend format
function mapBackendCommentToFrontend(backendComment: any): Comment {
  return {
    id: backendComment.id,
    commenterId: backendComment.userId,
    text: backendComment.content,
    createdAt: backendComment.createdAt || new Date().toISOString(),
  };
}

export function PostCard({ post }: { post: BackendPost }) {
  const { currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const author = post.author;
  if (!author || !currentUser) return null;

  const fullName = `${author.firstName} ${author.lastName}`;
  
  // Check if author has profilePicture, otherwise use fallback
  const avatarUrl = author.profilePicture || null;
  const postImage = post.media?.[0]?.url || null;

  const currentUserAvatar = PlaceHolderImages.find(img => img.id === currentUser.avatarId);

  const parsedDate = new Date(Date.parse(post.createdAt));
  const timeAgo = formatDistanceToNow(parsedDate, {
    addSuffix: true,
  });

  // Check if post is liked on mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const liked = await checkIfPostIsLiked(post.id);
        setIsLiked(liked.liked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [post.id]);

  useEffect(() => {
    const fetchComments = async () => {
      if (showComments) {
        setIsLoadingComments(true);
        try {
          const fetchedComments = await getComments(post.id);
          const transformedComments = fetchedComments.comments.map(mapBackendCommentToFrontend);
          setComments(transformedComments);
        } catch (error) {
          console.error("Error fetching comments:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load comments. Please try again.",
          });
        } finally {
          setIsLoadingComments(false);
        }
      }
    };

    fetchComments();
  }, [showComments, post.id]);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleLikePost = async () => {
    try {
      await likePost(post.id);
      
      // Toggle like state and update count
      setIsLiked(!isLiked);
      setLikesCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like post. Please try again.",
      });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const createdComment = await addComment(post.id, newComment);
      console.log("Created comment response:", createdComment);
      
      // Create the new comment object - use the text we just typed
      const newCommentObj: Comment = {
        id: createdComment.id || `c${Date.now()}`,
        commenterId: currentUser.id,
        text: newComment, // Use the text directly from input
        createdAt: createdComment.createdAt || new Date().toISOString(),
      };
      
      console.log("New comment to add:", newCommentObj);
      
      // Immediately add to state
      setComments(prevComments => {
        const currentComments = Array.isArray(prevComments) ? prevComments : [];
        const updatedComments = [...currentComments, newCommentObj];
        console.log("Updated comments array:", updatedComments);
        return updatedComments;
      });
      
      setCommentsCount(prevCount => prevCount + 1);
      setNewComment('');
      
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback>{author.firstName[0].toUpperCase()}</AvatarFallback>
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
          <div className="mt-4 rounded-lg overflow-hidden border">
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

      <CardFooter className="p-4 pt-0 flex-col items-start gap-4">
        <div className="flex gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={handleLikePost}>
            <Heart className={`mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {likesCount}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleToggleComments}
          >
            <MessageCircle className="mr-2" /> {commentsCount}
          </Button>
        </div>

        {showComments && (
          <>
            <Separator />
            <div className="w-full space-y-4">
              {isLoadingComments ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading comments...
                </p>
              ) : comments.length > 0 ? (
                comments.map(comment => {
                  const commenter = dummyUsers.find(u => u.id === comment.commenterId) || currentUser;
                  const commenterAvatar = PlaceHolderImages.find(img => img.id === commenter.avatarId);
                  
                  // Parse the comment's createdAt
                  const commentDate = comment.createdAt 
                    ? new Date(Date.parse(comment.createdAt))
                    : new Date();
                  const commentTimeAgo = formatDistanceToNow(commentDate, { addSuffix: true });
                  
                  return (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        {commenterAvatar?.imageUrl && (
                          <AvatarImage 
                            src={commenterAvatar.imageUrl} 
                            alt={commenter.name} 
                          />
                        )}
                        <AvatarFallback>{commenter.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-secondary rounded-lg px-3 py-2">
                          <Link href={`/profile/${commenter.id}`} className="font-semibold text-sm hover:underline">
                            {commenter.name}
                          </Link>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 pl-3">
                          {commentTimeAgo}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="w-full flex items-center gap-2 pt-2">
              <Avatar className="h-8 w-8">
                {currentUserAvatar?.imageUrl && (
                  <AvatarImage 
                    src={currentUserAvatar.imageUrl} 
                    alt={currentUser.name} 
                  />
                )}
                <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="h-9"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-9 w-9 flex-shrink-0" 
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </CardFooter>
    </Card>
  );
}