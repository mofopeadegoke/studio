'use client'

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { BackendPost, Comment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getAllPosts, getComments, getAllUsers, mapBackendUserToFrontendUserWithoutUserKey, deleteComment } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

// Transform backend comment format to frontend format
function mapBackendCommentToFrontend(backendComment: any): Comment {
  return {
    id: backendComment.id,
    commenterId: backendComment.userId,
    text: backendComment.content,
    createdAt: backendComment.createdAt,
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPost, setSelectedPost] = useState<BackendPost | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch posts.",
          variant: "destructive",
        });
      }
    };
    fetchPosts();
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const mappedUsers = data.users.map((backendUser: any) => mapBackendUserToFrontendUserWithoutUserKey(backendUser));
        const filteredUsers = mappedUsers.filter((u: User) => u.type !== 'Admin');
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    };
    fetchUsers();
    
  }, []);

  const handleViewClick = async (post: BackendPost) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
    setSelectedPostComments([]); // Clear previous comments
    
    // Fetch comments for this post
    setIsLoadingComments(true);
    try {
      const fetchedComments = await getComments(post.id);
      const transformedComments = fetchedComments.comments.map(mapBackendCommentToFrontend);
      setSelectedPostComments(transformedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const deleteParticularComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    // Remove from local state
    setSelectedPostComments(prevComments => 
      prevComments.filter(c => c.id !== commentId)
    );
    
    // Update the post's comment count in the posts list
    if (selectedPost) {
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === selectedPost.id 
            ? { ...p, commentsCount: p.commentsCount - 1 }
            : p
        )
      );
    }
    
    deleteParticularComment(commentId);
  };
  
  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
            <CardTitle>Manage Posts</CardTitle>
            <CardDescription>View all posts and their comments.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {posts.map(post => {
                    const author = post.author;
                    const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown';
                    
                    return (
                    <TableRow key={post.id}>
                        <TableCell className="font-medium">{authorName}</TableCell>
                        <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</TableCell>
                        <TableCell>{post.likesCount}</TableCell>
                        <TableCell>{post.commentsCount}</TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewClick(post)}>
                            View Details
                        </Button>
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
        </CardContent>
       </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>Viewing post and its comments.</DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="grid gap-4 py-4">
               <div>
                 <Label className="font-semibold">Content</Label>
                 <Textarea value={selectedPost.content} readOnly className="mt-1" />
               </div>

                <div>
                    <Label className="font-semibold">Comments</Label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {isLoadingComments ? (
                          <p className="text-sm text-muted-foreground">Loading comments...</p>
                        ) : selectedPostComments.length > 0 ? (
                          selectedPostComments.map(comment => {
                            const commenter = users.find(u => u.id === comment.commenterId);
                            return (
                                <Card key={comment.id}>
                                    <CardContent className="p-3 flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{commenter?.name || 'Unknown User'}</p>
                                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                                        </div>
                                        <Button 
                                          variant="destructive" 
                                          size="sm" 
                                          onClick={() => handleDeleteComment(comment.id)}
                                        >
                                          Delete
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No comments yet.</p>
                        )}
                    </div>
                </div>

            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}