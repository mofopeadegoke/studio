'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ImageIcon, Sparkles, VideoIcon, X } from 'lucide-react';
import { enhancePost } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/api/auth';

const MAX_UPLOAD_SIZE = 32 * 1024 * 1024; // 32MB

export function CreatePostForm({ currentUser }: { currentUser: User }) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const userAvatar = PlaceHolderImages.find(img => img.id === currentUser.avatarId);

  const handleEnhance = () => {
    if (!content) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please write something before enhancing with AI.",
      });
      return;
    }
    startTransition(async () => {
      const result = await enhancePost(content, currentUser.type);
      if (result.success && result.enhancedContent) {
        setContent(result.enhancedContent);
        toast({
          title: "Success",
          description: "Post enhanced with AI!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to enhance post.",
        });
      }
    });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const currentTotalSize = mediaFiles.reduce((acc, f) => acc + f.size, 0);
      if (currentTotalSize + file.size > MAX_UPLOAD_SIZE) {
        toast({
          variant: 'destructive',
          title: 'Upload Limit Exceeded',
          description: `You cannot upload more than 32MB of media.`,
        });
        return;
      }
      setMediaFiles(prev => [...prev, file]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please write something or add media.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for sending both text and media
      const formData = new FormData();
      formData.append('content', content);
      
      // Append all media files
      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      const response = await createPost(formData);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      // Clear form after successful post
      setContent('');
      setMediaFiles([]);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }

    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={userAvatar?.imageUrl} alt={currentUser.name} data-ai-hint={userAvatar?.imageHint} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Textarea
              placeholder="What's on your mind?"
              className="mb-2 min-h-24"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="grid gap-2 mb-2">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith('image/') ? (
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="Post preview"
                      width={600}
                      height={400}
                      className="rounded-lg object-cover w-full aspect-video"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      controls
                      className="rounded-lg object-cover w-full aspect-video"
                    />
                  )}
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-muted-foreground">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="video/*"
                />
                <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()}>
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()}>
                  <VideoIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEnhance} disabled={isPending}>
                  <Sparkles className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                  {isPending ? 'Enhancing...' : 'Enhance with AI'}
                </Button>
                <Button onClick={handlePost} disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}