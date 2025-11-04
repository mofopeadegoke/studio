
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        const user = users.find(u => u.id === storedUserId);
        setCurrentUser(user || null);
      }
    } catch (error) {
        console.error("Could not access local storage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('currentUserId', user.id);
      } catch (error) {
        console.error("Could not access local storage", error);
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUserId');
    } catch (error) {
        console.error("Could not access local storage", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {!loading && children}
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
