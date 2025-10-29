import Link from 'next/link';
import { conversations, users } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';

export default function MessagesPage() {
  const currentUser = users.find(u => u.id === '1'); // Simulate logged in user
  if (!currentUser) return null;

  // For this demo, we'll display the first conversation.
  const activeConversation = conversations[0];
  const otherParticipantId = activeConversation.participantIds.find(id => id !== currentUser.id);
  const otherParticipant = users.find(u => u.id === otherParticipantId);
  if (!otherParticipant) return null;

  const otherParticipantAvatar = PlaceHolderImages.find(img => img.id === otherParticipant.avatarId);

  return (
    <div className="h-[calc(100vh-57px-2rem)] md:h-[calc(100vh-57px-3rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full border rounded-lg overflow-hidden">
        <div className="md:col-span-1 lg:col-span-1 border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Messages</h1>
          </div>
          <ScrollArea className="flex-1">
            {conversations.map(conv => {
              const participantId = conv.participantIds.find(id => id !== currentUser.id);
              const participant = users.find(u => u.id === participantId);
              if (!participant) return null;
              const participantAvatar = PlaceHolderImages.find(img => img.id === participant.avatarId);
              const lastMessage = conv.messages[conv.messages.length - 1];

              return (
                <Link href="#" key={conv.id}>
                  <div className={cn("flex items-center gap-3 p-4 border-b hover:bg-accent/50", conv.id === activeConversation.id && "bg-accent/80")}>
                    <Avatar>
                      <AvatarImage src={participantAvatar?.imageUrl} alt={participant.name} data-ai-hint={participantAvatar?.imageHint} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold truncate">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNowStrict(new Date(lastMessage.timestamp))}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </ScrollArea>
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
          <div className="flex items-center gap-3 p-3 border-b">
            <Avatar>
              <AvatarImage src={otherParticipantAvatar?.imageUrl} alt={otherParticipant.name} data-ai-hint={otherParticipantAvatar?.imageHint} />
              <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold font-headline">{otherParticipant.name}</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {activeConversation.messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser.id;
                const sender = isCurrentUser ? currentUser : otherParticipant;
                const senderAvatar = PlaceHolderImages.find(img => img.id === sender.avatarId);

                return (
                  <div key={index} className={cn("flex items-end gap-3", isCurrentUser && 'flex-row-reverse')}>
                    {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={senderAvatar?.imageUrl} alt={sender.name} data-ai-hint={senderAvatar?.imageHint} />
                            <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-xs lg:max-w-md rounded-lg px-4 py-2',
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-secondary rounded-bl-none'
                      )}
                    >
                      <p>{message.text}</p>
                      <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {format(new Date(message.timestamp), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form className="relative">
              <Input
                placeholder="Type a message..."
                className="pr-12"
              />
              <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
