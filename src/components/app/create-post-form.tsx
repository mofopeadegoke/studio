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
  <Card className='w-full overflow-hidden'>
    <CardContent className="p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <Avatar className="flex-shrink-0">
          <AvatarImage src={userAvatar?.imageUrl} alt={currentUser.name} data-ai-hint={userAvatar?.imageHint} />
          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="w-full min-w-0 flex-1">
          <Textarea
            placeholder="What's on your mind?"
            className="mb-2 min-h-24 w-full resize-none"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="grid gap-2 mb-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative w-full">
                {file.type.startsWith('image/') ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Post preview"
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full h-auto max-h-[400px]"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    playsInline
                    className="rounded-lg object-cover w-full h-auto max-h-[400px]"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
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
              <Button variant="ghost" size="icon" onClick={() => imageInputRef.current?.click()} className="flex-shrink-0">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => videoInputRef.current?.click()} className="flex-shrink-0">
                <VideoIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleEnhance} 
                disabled={isPending}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
                size="sm"
              >
                <Sparkles className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isPending ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isPending ? 'Enhancing...' : 'Enhance with AI'}</span>
                <span className="sm:hidden">{isPending ? 'Enhancing...' : 'Enhance'}</span>
              </Button>
              <Button 
                onClick={handlePost} 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
                size="sm"
              >
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