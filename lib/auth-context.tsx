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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usersData, setUsersData] = useState<Record<string, User>>(mockUsers);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock authentication - in real app this would call an API
    const foundUser = Object.values(usersData).find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  }, [usersData]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock signup - in real app this would call an API
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      avatar: role === 'student' ? '👩‍🎓' : '👨‍🏫',
      createdAt: new Date(),
      // Teachers start as pending
      teacherStatus: role === 'teacher' ? 'pending' : undefined,
    };
    setUser(newUser);
    // Add to users data
    setUsersData(prev => ({ ...prev, [newUser.id]: newUser }));
    setIsLoading(false);
  }, []);

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
