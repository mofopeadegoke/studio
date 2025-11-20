import type { PlaceHolderImages } from "./placeholder-images";

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
