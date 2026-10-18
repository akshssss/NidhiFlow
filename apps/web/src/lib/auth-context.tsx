'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STARTUP' | 'INVESTOR' | 'ADMIN';
  emailVerified: boolean;
  startup?: {
    id: string;
    companyName: string;
    verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    logoUrl?: string;
  } | null;
  investor?: {
    id: string;
    displayName: string;
    verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    avatarUrl?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('nidhiflow_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        return;
      }
      setToken(storedToken);
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
        localStorage.removeItem('nidhiflow_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('nidhiflow_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('nidhiflow_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('nidhiflow_token');
      setToken(null);
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
