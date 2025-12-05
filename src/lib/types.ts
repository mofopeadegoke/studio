import type { PlaceHolderImages } from "./placeholder-images";
import { z } from "zod";

export type UserType = 'Player' | 'Team' | 'Fan' | 'Scout' | 'Admin';

export type User = {
  id: string;
  name: string;
  type: UserType;
  avatarId: (typeof PlaceHolderImages)[number]['id'];
  bio: string;
  connections: string[]; // array of user IDs
  followers: string[]; // array of user IDs
  following: string[]; // array of user IDs
  stats?: Record<string, string | number>;
  profileCoverId?: (typeof PlaceHolderImages)[number]['id'];
};

export type Post = {
  id: string;
  authorId: string;
  content: string;
  imageId?: (typeof PlaceHolderImages)[number]['id'];
  createdAt: string; // ISO string
  likes: number;
  comments: {
    id: string;
    commenterId: string;
    text: string;
    createdAt: string;
  }[];
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  location: string;
  bannerId: (typeof PlaceHolderImages)[number]['id'];
  registeredUsers: string[];
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string; // ISO string
};

export type Conversation = {
  id: string;
  participantIds: string[];
  messages: Message[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  score: number;
  category: string;
};

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  accountType: z.enum(['Player', 'Team', 'Scout', 'Fan']),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export type MediaItem = {
  url: string;
  type: 'image' | 'video';
  publicId: string;
};

export type BackendPost = {
  id: string;
  userId: string;
  content: string;
  media: MediaItem[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    email: string;
    accountType: "Player" | "Team" | "Scout" | "Fan";
  };
}

export type Comment = {
  id: string;
  commenterId: string;
  text: string;
  createdAt: string; // ISO string
};

export type BackendUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: "Player" | "Team" | "Scout" | "Fan" | "Admin";
  profilePicture: string | null;
  googleId?: string; 
  isEmailVerified: boolean;
}

  export type BackendEvent = {
    id: string;
    title: string;
    description: string;
    date: string; // ISO string
    location: string;
    media: MediaItem[];
    organizerId: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    organizer: BackendUser;
    attendees: BackendUser[];
    attendeesCount: number;
  };

  export type Challenge = {
    id: string;
    title: string;
    description: string;
    hashtag: string;
};

export type BackendMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: BackendUser;
};

export type BackendConversation = {
  id: string;
  name: string | null;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  participants: BackendUser[];
  messages: BackendMessage[];
};