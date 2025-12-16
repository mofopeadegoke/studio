'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { User } from '@/lib/types';
import { users as dummyUsers } from '@/lib/data';
import { getUserProfile } from '@/api/auth';
import Loader from '@/components/ui/loader';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
}

function getRandomDummyUser() {
  return dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
}

function mapBackendUserToFrontendUser(backendUser: any): User {
  const randomDummy = getRandomDummyUser();

  return {
    id: backendUser.user.id,

    // Combine real backend data with dummy data
    name: `${backendUser.user.firstName} ${backendUser.user.lastName}`,
    type: backendUser.user.accountType,

    // Use dummy user's avatar instead of placeholder
    avatarId: randomDummy.avatarId,

    // Use dummy user's bio
    bio: randomDummy.bio ?? "",

    // Use dummy user's social graph
    connections: randomDummy.connections ?? [],
    followers: randomDummy.followers ?? [],
    following: randomDummy.following ?? [],

    // Use dummy user's stats if they exist
    stats: randomDummy.stats ?? {},

    // Use their dummy profile cover if available
    profileCoverId: randomDummy.profileCoverId,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasAttemptedFetch = useRef(false); // Track if we've already attempted to fetch

  useEffect(() => {
  const fetchUserProfile = async () => {
    if (hasAttemptedFetch.current) return;
    hasAttemptedFetch.current = true;

    // Check if we have an auth token before attempting to fetch
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      setCurrentUser(null);
      return;
    }

    try {
      const profile = await getUserProfile();
      const frontendUser = mapBackendUserToFrontendUser(profile);
      connectSocket();
      setCurrentUser(frontendUser);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Clear invalid token on error
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      disconnectSocket();
    } finally {
      setLoading(false);
    }
  };

  fetchUserProfile();
}, []);
  const login = (userId: string) => {
    const user = dummyUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('currentUserId', user.id);
        connectSocket(); // Reconnect socket on login
      } catch (error) {
        console.error("Could not access local storage", error);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUserId');
      disconnectSocket();
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, setCurrentUser }}>
      {!loading && children}
      {loading && <Loader />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}