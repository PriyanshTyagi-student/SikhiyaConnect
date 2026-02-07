'use client';

import React from "react"

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Otherwise, proceed with normal backend login
      const sessionUser = await login(email, password);
      const refreshedUser = await refreshUser().catch(() => null);
      const activeUser = refreshedUser ?? sessionUser;
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      });

      if (!activeUser?.role) {
        toast({
          title: 'Session error',
          description: 'User role not available after login. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Route based on user role
      if (activeUser?.role === 'admin') {
        router.push('/admin');
      } else if (activeUser?.role === 'teacher' && activeUser?.teacherStatus === 'pending') {
        router.push('/teacher/pending');
      } else if (activeUser?.role === 'teacher') {
        router.push('/teacher');
      } else {
        // All other users (students and approved teachers) go to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => router.push('/')}
        >
          ← Back to Home
        </Button>
        <Card className="border-white/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 mb-2">Sikhiya Connect</h1>
              <p className="text-foreground/70">Welcome back! Sign in to continue.</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="text-right">
             <Link
              href="/auth/forgot-password"
              className="text-sm text-foreground/70 hover:text-foreground underline-offset-4 hover:underline"
             >
             Forgot password?
             </Link>
            </div>


            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/70 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/sign-up" className="text-foreground hover:text-foreground underline-offset-4 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
}
