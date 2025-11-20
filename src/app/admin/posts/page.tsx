
'use client'

import { useState } from 'react';
import { posts as initialPosts, users } from '@/lib/data';
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
import { Post } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewClick = (post: Post) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(posts.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                comments: p.comments.filter(c => c.id !== commentId)
            }
        }
        return p;
    }));
    if (selectedPost?.id === postId) {
        setSelectedPost({
            ...selectedPost,
            comments: selectedPost.comments.filter(c => c.id !== commentId)
        });
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
                    const author = users.find(u => u.id === post.authorId);
                    return (
                    <TableRow key={post.id}>
                        <TableCell className="font-medium">{author?.name ?? 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</TableCell>
                        <TableCell>{post.likes}</TableCell>
                        <TableCell>{post.comments.length}</TableCell>
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
                        {selectedPost.comments.length > 0 ? selectedPost.comments.map(comment => {
                            const commenter = users.find(u => u.id === comment.commenterId);
                            return (
                                <Card key={comment.id}>
                                    <CardContent className="p-3 flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{commenter?.name}</p>
                                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(selectedPost.id, comment.id)}>Delete</Button>
                                    </CardContent>
                                </Card>
                            )
                        }) : <p className="text-sm text-muted-foreground">No comments yet.</p>}
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
