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
import { BackendPost, Comment, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  getAllPosts, 
  getComments, 
  getAllUsers, 
  mapBackendUserToFrontendUserWithoutUserKey, 
  deleteComment, 
  deletePost 
} from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

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
  
  // Post Details (View) State
  const [selectedPost, setSelectedPost] = useState<BackendPost | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Post Deletion State
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

    fetchPosts();
    fetchUsers();
  }, [toast]);

  const handleViewClick = async (post: BackendPost) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
    setSelectedPostComments([]); 
    
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
    setSelectedPostComments(prevComments => 
      prevComments.filter(c => c.id !== commentId)
    );
    
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

  // Set the post ID to open the deletion confirmation modal
  const triggerDeletePost = (postId: string) => {
    setPostToDelete(postId);
  };

  // Execute the deletion API call
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    try {
      await deletePost(postToDelete);
      
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete));
      
      toast({
        title: "Success",
        description: "Post deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPostToDelete(null); // Close the modal
    }
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
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewClick(post)}>
                                View Details
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => triggerDeletePost(post.id)}>
                                Delete
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
        </CardContent>
       </Card>

      {/* View Post Details Dialog */}
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

      {/* Standardized Delete Confirmation Dialog */}
      <Dialog 
        open={!!postToDelete} 
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setPostToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the post and remove all associated data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setPostToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePost}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}