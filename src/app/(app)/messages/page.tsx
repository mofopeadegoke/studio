"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Loader2, Send, Pencil } from "lucide-react";

import { getSocket } from "@/lib/socket";
import { getConversationMessages, getUserConversations, getAllUsersNonAdmin, mapBackendUserToFrontendUserWithoutUserKey } from "@/api/auth";
import { startConversation } from "@/lib/socketHelper";
import { useAuth } from "@/context/auth-context";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { User, BackendConversation, BackendMessage } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Messages() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const [conversations, setConversations] = useState<BackendConversation[]>([]);
  const [messages, setMessages] = useState<BackendMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [nonAdminUsers, setNonAdminUsers] = useState<User[]>([]);
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dummyAvatar = PlaceHolderImages[0];

  // Get active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  // Get the other participant(s)
  const otherParticipants = activeConversation?.participants?.filter(p => p.id !== currentUser?.id) || [];
  const otherParticipant = otherParticipants[0];

  // Display name for conversation
  const getConversationDisplayName = (conv: BackendConversation) => {
    if (conv.isGroup && conv.name) {
      return conv.name;
    }
    
    if (!conv.participants || conv.participants.length === 0) {
      return 'Loading...';
    }
    
    // Find other participant
    const other = conv.participants?.find(p => {
      return String(p.id) !== String(currentUser?.id);
    });
    
    if (!other) {
      return 'Loading...';
    }
    
    // Try to get name from various possible fields
    if (other.firstName && other.lastName) {
      return `${other.firstName} ${other.lastName}`;
    }
    
    if (other.email) return other.email.split('@')[0];
    
    return 'Loading...';
  };

  // Get participant avatar - checks for profilePicture, returns null if not available
  const getParticipantAvatar = (participant: any) => {
    if (participant?.profilePicture) {
      return participant.profilePicture;
    }
    return null;
  };

  // Get user avatar for user picker - checks for avatarId and maps to placeholder
  const getUserAvatar = (user: User) => {
    if (user.avatarId) {
      const userPlaceholder = PlaceHolderImages.find(img => img.id === user.avatarId);
      if (userPlaceholder?.imageUrl) {
        return userPlaceholder.imageUrl;
      }
    }
    return null;
  };

  // Helper to enrich participant data
  const enrichParticipantData = (participant: any, userId?: string) => {
    if (!participant) return participant;
    
    // If we have user data in nonAdminUsers, use it
    const fullUserData = nonAdminUsers.find(u => u.id === participant.id);
    
    if (fullUserData) {
      return {
        ...participant,
        id: fullUserData.id,
        firstName: fullUserData.name?.split(' ')[0] || 'Unknown',
        lastName: fullUserData.name?.split(' ')[1] || '',
      };
    }
    
    // If it's the current user, use currentUser data
    if (userId && participant.id === userId) {
      return {
        ...participant,
        firstName: currentUser?.name || 'You',
        lastName: '',
      };
    }
    
    // Ensure at least basic structure
    return {
      ...participant,
      firstName: participant.firstName || participant.name?.split(' ')[0] || 'Loading...',
      lastName: participant.lastName || participant.name?.split(' ')[1] || '',
    };
  };

  useEffect(() => {
    let mounted = true;

    getSocket()
      .then((s) => {
        if (mounted) setSocket(s);
      })
      .catch((err) => console.error("Error getting socket:", err));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    const onNewMessage = (msg: BackendMessage) => {
      setMessages((prev) => [...prev, msg]);
      
      // Update conversations list with latest message
      setConversations((prev) => 
        prev.map(conv => {
          if (conv.id === msg.conversationId) {
            return {
              ...conv,
              messages: [msg],
            };
          }
          return conv;
        })
      );
    };

    const onUserTyping = (data: any) => {
      if (data?.conversationId === activeConversationId) {
        setUserTyping(true);
        clearTimeout((window as any).__typingTimeout);
        (window as any).__typingTimeout = setTimeout(() => setUserTyping(false), 800);
      }
    };

    const onConversationCreated = (conversation: BackendConversation) => {
      console.log("📥 New conversation created event received:", conversation);
      
      // Add conversation immediately with current data
      setConversations((prev) => {
        // Remove any existing conversation with same ID
        const filtered = prev.filter(c => c.id !== conversation.id);
        return [conversation, ...filtered];
      });
      
      setActiveConversationId(conversation.id);
      setMessages([]);
      setLoadingMessages(false);
      
      // Join the conversation room
      socket.emit("join_conversation", { conversationId: conversation.id });
      
      // Close dialog and reset creating state
      setIsNewMessageDialogOpen(false);
      setCreatingConversation(false);
      
      // Now try to enrich the conversation with user data
      setTimeout(() => {
        setConversations((prev) => {
          return prev.map(conv => {
            if (conv.id === conversation.id) {
              // Enrich participants with current nonAdminUsers data
              const enrichedParticipants = conv.participants?.map(participant => 
                enrichParticipantData(participant, currentUser?.id)
              ) || [];
              
              return {
                ...conv,
                participants: enrichedParticipants,
              };
            }
            return conv;
          });
        });
      }, 100);
      
      toast({
        title: 'Success',
        description: 'Conversation ready!',
      });
    };

    const onError = (err: any) => {
      console.error("Socket error:", err);
      setCreatingConversation(false);
      toast({
        title: 'Error',
        description: err?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("conversation_created", onConversationCreated);
    socket.on("error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("conversation_created", onConversationCreated);
      socket.off("error", onError);
    };
  }, [socket, activeConversationId, currentUser, nonAdminUsers]);

  useEffect(() => {
    async function loadConversations() {
      setIsLoadingConversations(true);
      try {
        const data = await getUserConversations();
        
        // Enrich all conversations with complete participant data
        const enrichedConversations = data?.map((conv:any) => ({
          ...conv,
          participants: conv.participants?.map((participant:any) => 
            enrichParticipantData(participant, currentUser?.id)
          ) || []
        })) || [];
        
        setConversations(enrichedConversations);
        
        // Auto-select first conversation if none selected
        if (enrichedConversations.length > 0 && !activeConversationId) {
          setActiveConversationId(enrichedConversations[0].id);
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error);
        toast({
          title: 'Error Loading Conversations',
          description: error?.message || 'Failed to load conversations',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingConversations(false);
      }
    }

    async function loadNonAdminUsers() {
      if (!currentUser) return;
      
      try {
        const data = await getAllUsersNonAdmin();
        const mappedUsers = data.users?.map((user: any) => mapBackendUserToFrontendUserWithoutUserKey(user)) || [];
        const filteredUsers = mappedUsers.filter((user: User) => user.id !== currentUser.id);
        setNonAdminUsers(filteredUsers);
        
        // After loading nonAdminUsers, refresh conversations to enrich them
        if (conversations.length > 0) {
          setConversations(prev => {
            return prev.map(conv => {
              const enrichedParticipants = conv.participants?.map(participant => 
                enrichParticipantData(participant, currentUser?.id)
              ) || [];
              
              return {
                ...conv,
                participants: enrichedParticipants,
              };
            });
          });
        }
      } catch (error: any) {
        console.error("Error fetching non-admin users:", error);
      }
    }

    loadConversations();
    loadNonAdminUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!activeConversationId) return;

    async function loadMessages() {
      setLoadingMessages(true);

      try {
        const data = await getConversationMessages(activeConversationId);
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }

      socket?.emit("join_conversation", { conversationId: activeConversationId });
    }

    loadMessages();
  }, [activeConversationId, socket]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !activeConversationId) return;

    socket.emit("send_message", {
      conversationId: activeConversationId,
      text: newMessage.trim(),
      content: newMessage.trim(),
    });

    setNewMessage("");
    handleStopTyping();
  };

  const handleStartTyping = () => {
    if (!socket || userTyping || !activeConversationId) return;

    socket.emit("typing", { conversationId: activeConversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!socket || !activeConversationId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleStartTyping();
  };

  const handleStartNewConversation = async (recipientId: string) => {
    if (!socket) {
      toast({
        title: 'Error',
        description: 'Connection not established. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    // Check if conversation already exists with this user
    const existingConversation = conversations.find(conv => {
      if (!conv.isGroup) {
        const otherUser = conv.participants?.find(p => p.id !== currentUser?.id);
        return otherUser?.id === recipientId;
      }
      return false;
    });

    if (existingConversation) {
      // Conversation exists, just activate it
      setActiveConversationId(existingConversation.id);
      setIsNewMessageDialogOpen(false);
      setCreatingConversation(false);
      
      toast({
        title: 'Info',
        description: 'Opening existing conversation',
      });
      return;
    }

    setCreatingConversation(true);
    
    // Use the socket helper function
    try {
      await startConversation(socket, recipientId);
      // The conversation_created event will handle the rest
    } catch (error) {
      console.error("Error starting conversation:", error);
      setCreatingConversation(false);
      toast({
        title: 'Error',
        description: 'Failed to create conversation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!currentUser) return null;

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-57px-2rem)]">
        <div className="text-center">
          <p className="mb-2">Loading conversations...</p>
          {!socketConnected && (
            <p className="text-sm text-muted-foreground">Connecting to messaging service...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px-2rem)] md:h-[calc(100vh-57px-3rem)]">
      <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full border rounded-lg overflow-hidden">
          {/* Conversations List */}
          <div className="md:col-span-1 lg:col-span-1 border-r flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h1 className="text-2xl font-bold font-headline">Messages</h1>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-5 w-5" />
                  <span className="sr-only">New Message</span>
                </Button>
              </DialogTrigger>
            </div>
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet. Start a new one!
                </div>
              ) : (
                conversations.map(conv => {
                  const participant = conv.participants?.find(p => p.id !== currentUser.id);
                  const displayName = getConversationDisplayName(conv);
                  const lastMessage = conv.messages?.[conv.messages.length - 1];
                  const avatarUrl = participant ? getParticipantAvatar(participant) : null;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className="w-full text-left"
                    >
                      <div className={cn(
                        "flex items-center gap-3 p-4 border-b hover:bg-accent/50",
                        conv.id === activeConversationId && "bg-accent/80"
                      )}>
                        <Avatar>
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                          <AvatarFallback>
                            {displayName === 'Loading...' ? '...' : displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold truncate">
                              {displayName}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNowStrict(new Date(lastMessage.createdAt))}
                              </p>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
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
            {creatingConversation ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Creating conversation...</p>
              </div>
            ) : activeConversation && otherParticipant ? (
              <>
                {/* Conversation Header */}
                <div className="flex items-center gap-3 p-3 border-b">
                  <Avatar>
                    {getParticipantAvatar(otherParticipant) && (
                      <AvatarImage 
                        src={getParticipantAvatar(otherParticipant)!} 
                        alt={getConversationDisplayName(activeConversation)} 
                      />
                    )}
                    <AvatarFallback>
                      {getConversationDisplayName(activeConversation).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold font-headline">
                    {getConversationDisplayName(activeConversation)}
                  </h2>
                  <div className="ml-auto text-sm">
                    {socketConnected ? (
                      <span className="text-green-600">● Connected</span>
                    ) : (
                      <span className="text-red-500">● Connecting...</span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {messages.map((message) => {
                        // FIXED: Proper comparison to determine if message is from current user
                        const isCurrentUser = String(message.senderId) === String(currentUser.id);
                        const sender = message.sender;
                        const senderName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : 'Unknown';
                        const senderAvatar = sender ? getParticipantAvatar(sender) : null;

                        return (
                          <div 
                            key={message.id} 
                            className={cn(
                              "flex items-end gap-3",
                              isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                            )}
                          >
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8">
                                {senderAvatar && (
                                  <AvatarImage src={senderAvatar} alt={senderName} />
                                )}
                                <AvatarFallback>
                                  {senderName.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
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
                              <p className={cn(
                                "text-xs mt-1", 
                                isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {format(new Date(message.createdAt), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Typing Indicator */}
                      {userTyping && (
                        <div className="flex items-end gap-3">
                          <Avatar className="h-8 w-8">
                            {getParticipantAvatar(otherParticipant) && (
                              <AvatarImage 
                                src={getParticipantAvatar(otherParticipant)!} 
                                alt={getConversationDisplayName(activeConversation)} 
                              />
                            )}
                            <AvatarFallback>
                              {getConversationDisplayName(activeConversation).charAt(0).toUpperCase()}
                            </AvatarFallback>
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
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative">
                    <Input
                      value={newMessage}
                      onChange={handleInputChange}
                      onBlur={handleStopTyping}
                      placeholder="Type a message..."
                      className="pr-12"
                      disabled={!activeConversationId}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7"
                      disabled={!newMessage.trim() || !activeConversationId}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col flex-1">
                <div className="p-3 border-b text-sm">
                  {socketConnected ? (
                    <span className="text-green-600">● Connected</span>
                  ) : (
                    <span className="text-red-500">● Connecting...</span>
                  )}
                </div>
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Select a conversation or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Message Dialog */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Select a user to start a conversation with.
            </DialogDescription>
          </DialogHeader>
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search for a user..." />
            <CommandList>
              <ScrollArea className="h-48">
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {nonAdminUsers.map((user) => {
                    const userAvatarUrl = getUserAvatar(user);
                    
                    return (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.type}`}
                        onSelect={() => handleStartNewConversation(user.id)}
                        disabled={creatingConversation}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-8 w-8">
                            {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={user.name} />}
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.type}</p>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}