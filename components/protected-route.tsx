'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
  requiredTeacherStatus?: 'approved' | 'pending' | 'rejected';
  fallbackRoute?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredTeacherStatus = 'approved',
  fallbackRoute = '/',
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push(fallbackRoute);
      return;
    }

    if (requiredRole === 'teacher' && user.teacherStatus !== requiredTeacherStatus) {
      if (user.teacherStatus === 'pending') {
        router.push('/teacher/pending');
      } else if (user.teacherStatus === 'rejected') {
        router.push(fallbackRoute);
      }
      return;
    }
  }, [user, requiredRole, requiredTeacherStatus, router, fallbackRoute]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
