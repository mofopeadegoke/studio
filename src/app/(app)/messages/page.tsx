'use client';

import { useState, useEffect, useRef } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { getSocket } from '@/lib/socket';
import { getUserConversations, getConversationMessages } from '@/api/auth';
import type { BackendConversation, BackendMessage } from '@/lib/types';

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<BackendConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const socket = getSocket();

  if (!currentUser) return null;

  // Get active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  // Get the other participant(s)
  const otherParticipants = activeConversation?.participants.filter(p => p.id !== currentUser.id) || [];
  const otherParticipant = otherParticipants[0]; // For 1-on-1 chats
  
  // Get participant avatar (using dummy avatar as fallback)
  const dummyAvatar = PlaceHolderImages[0];
  const getParticipantAvatar = (participant: any) => {
    return participant?.profilePicture || dummyAvatar?.imageUrl;
  };

  // Display name for conversation
  const getConversationDisplayName = (conv: BackendConversation) => {
    if (conv.isGroup && conv.name) {
      return conv.name;
    }
    const other = conv.participants.find(p => p.id !== currentUser.id);
    return other ? `${other.firstName} ${other.lastName}` : 'Unknown';
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getUserConversations();
        setConversations(data);
        
        // Auto-select first conversation
        if (data.length > 0) {
          setActiveConversationId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await getConversationMessages(activeConversationId);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  // Set up Socket.io listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (message: BackendMessage) => {
      console.log('New message received:', message);
      
      // Add message to the active conversation
      if (message.conversationId === activeConversationId) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Update conversations list with latest message
      setConversations((prev) => 
        prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              messages: [message], // Just store the latest message
            };
          }
          return conv;
        })
      );
    });

    // Listen for typing indicators
    socket.on('user_typing', ({ conversationId, userId, isTyping: typing }) => {
      if (conversationId === activeConversationId && userId !== currentUser.id) {
        setIsTyping(typing);
      }
    });

    // Listen for errors
    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('error');
    };
  }, [socket, activeConversationId, currentUser.id]);

  // Join conversation when selected
  useEffect(() => {
    if (!socket || !activeConversationId) return;

    console.log('Joining conversation:', activeConversationId);
    socket.emit('join_conversation', { conversationId: activeConversationId });
  }, [socket, activeConversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!socket || !newMessage.trim() || !activeConversationId) return;

    console.log('Sending message:', newMessage);
    
    // Emit message to server
    socket.emit('send_message', {
      conversationId: activeConversationId,
      content: newMessage,
    });

    // Clear input
    setNewMessage('');
    handleStopTyping();
  };

  const handleStartTyping = () => {
    if (!socket || isTyping || !activeConversationId) return;

    socket.emit('typing_start', { conversationId: activeConversationId });

    // Auto-stop after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!socket || !activeConversationId) return;

    socket.emit('typing_stop', { conversationId: activeConversationId });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleStartTyping();
  };

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-57px-2rem)]">
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px-2rem)] md:h-[calc(100vh-57px-3rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full border rounded-lg overflow-hidden">
        {/* Conversations List */}
        <div className="md:col-span-1 lg:col-span-1 border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Messages</h1>
          </div>
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              conversations.map(conv => {
                const participant = conv.participants.find(p => p.id !== currentUser.id);
                const displayName = getConversationDisplayName(conv);
                const lastMessage = conv.messages[conv.messages.length - 1];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className="w-full text-left"
                  >
                    <div className={cn(
                      "flex items-center gap-3 p-4 border-b hover:bg-accent/50 max-w-[96%]",
                      conv.id === activeConversationId && "bg-accent/80"
                    )}>
                      <Avatar>
                        <AvatarImage 
                          src={participant ? getParticipantAvatar(participant) : dummyAvatar.imageUrl} 
                          alt={displayName} 
                        />
                        <AvatarFallback>
                          {displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold truncate">{displayName}</p>
                          {lastMessage && (
                            <p className="text-xs">
                              {formatDistanceToNowStrict(new Date(lastMessage.createdAt))}
                            </p>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-sm truncate text-muted-foreground">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Active Conversation */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
          {activeConversation && otherParticipant ? (
            <>
              {/* Conversation Header */}
              <div className="flex items-center gap-3 p-3 border-b">
                <Avatar>
                  <AvatarImage 
                    src={getParticipantAvatar(otherParticipant)} 
                    alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`} 
                  />
                  <AvatarFallback>{otherParticipant.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold font-headline">
                  {getConversationDisplayName(activeConversation)}
                </h2>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.senderId === currentUser.id;
                      const sender = message.sender;
                      const senderName = `${sender.firstName} ${sender.lastName}`;

                      return (
                        <div key={message.id} className={cn("flex items-end gap-3", isCurrentUser && 'flex-row-reverse')}>
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={getParticipantAvatar(sender)} 
                                alt={senderName} 
                              />
                              <AvatarFallback>{sender.firstName.charAt(0)}</AvatarFallback>
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
                            <p>{message.content}</p>
                            <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {format(new Date(message.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-end gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={getParticipantAvatar(otherParticipant)} 
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`} 
                          />
                          <AvatarFallback>{otherParticipant.firstName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary rounded-lg rounded-bl-none px-4 py-2">
                          <p className="text-sm text-muted-foreground italic">typing...</p>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="relative">
                  <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    onBlur={handleStopTyping}
                    placeholder="Type a message..."
                    className="pr-12"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}