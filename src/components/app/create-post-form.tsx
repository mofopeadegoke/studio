'use client';

import { useState, useTransition } from 'react';
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

export function CreatePostForm({ currentUser }: { currentUser: User }) {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
  
  const handleImageSelect = () => {
    const postImage = PlaceHolderImages.find(img => img.id === 'post-basketball-dunk');
    if(postImage) {
        setImagePreview(postImage.imageUrl);
    }
  }

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
            {imagePreview && (
              <div className="relative mb-2">
                <Image
                  src={imagePreview}
                  alt="Post preview"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover w-full aspect-video"
                />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 rounded-full"
                    onClick={() => setImagePreview(null)}
                >
                    <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon" onClick={handleImageSelect}>
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <VideoIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEnhance} disabled={isPending}>
                  <Sparkles className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                  {isPending ? 'Enhancing...' : 'Enhance with AI'}
                </Button>
                <Button>Post</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
