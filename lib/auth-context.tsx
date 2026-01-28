'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from './types';
import { mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>;
  approveTeacher: (teacherId: string) => void;
  rejectTeacher: (teacherId: string) => void;
  getPendingTeachers: () => User[];
  updateUser: (user: User) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const TOKEN_KEY = "sikhiya_token";
const USER_KEY = "sikhiya_user";


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usersData, setUsersData] = useState<Record<string, User>>(mockUsers);

  React.useEffect(() => {
  const token = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);

  if (token && savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);

  const login = async (email: string, password: string) => {
  setIsLoading(true);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    setIsLoading(false);
    throw new Error("Invalid credentials");
  }

  const data = await res.json();

  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  setUser(data.user);
  setIsLoading(false);
};



  const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setUser(null);
};


  const signup = async (
  email: string,
  password: string,
  name: string,
  role: 'student' | 'teacher'
) => {
  setIsLoading(true);

  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!res.ok) {
    const err = await res.json();
    setIsLoading(false);
    throw new Error(err.detail);
  }

  setIsLoading(false);
};


  const approveTeacher = useCallback((teacherId: string) => {
    setUsersData(prev => {
      const updated = { ...prev };
      if (updated[teacherId]) {
        updated[teacherId] = { ...updated[teacherId], teacherStatus: 'approved' };
        // Update current user if it's the same teacher
        if (user?.id === teacherId) {
          setUser(updated[teacherId]);
        }
      }
      return updated;
    });
  }, [user?.id]);

  const rejectTeacher = useCallback((teacherId: string) => {
    setUsersData(prev => {
      const updated = { ...prev };
      if (updated[teacherId]) {
        updated[teacherId] = { ...updated[teacherId], teacherStatus: 'rejected' };
        // Update current user if it's the same teacher
        if (user?.id === teacherId) {
          setUser(updated[teacherId]);
        }
      }
      return updated;
    });
  }, [user?.id]);

  const getPendingTeachers = useCallback((): User[] => {
    return Object.values(usersData).filter(u => u.role === 'teacher' && u.teacherStatus === 'pending');
  }, [usersData]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    setUsersData(prev => ({ ...prev, [updatedUser.id]: updatedUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup, approveTeacher, rejectTeacher, getPendingTeachers, updateUser }}>
      {children}
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
