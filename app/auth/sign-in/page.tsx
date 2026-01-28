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
  const [email, setEmail] = useState('priya@sikhiya.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      });
      // Route based on user role
      const foundUser = email === 'admin@sikhiya.com';
      if (foundUser) {
        router.push('/admin');
      } else if (email === 'aisha@sikhiya.com' || email === 'vikram@sikhiya.com') {
        // Pending teachers
        router.push('/teacher/pending');
      } else {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sikhiya Connect</h1>
            <p className="text-slate-600 dark:text-slate-400">Welcome back! Sign in to continue.</p>
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/sign-up" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-3 font-semibold">Demo Credentials:</p>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="font-medium text-slate-900 dark:text-white">Student</p>
                <p className="text-slate-600 dark:text-slate-400">priya@sikhiya.com</p>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded">
                <p className="font-medium text-slate-900 dark:text-white">Pending Teacher</p>
                <p className="text-slate-600 dark:text-slate-400">aisha@sikhiya.com</p>
                <p className="text-slate-600 dark:text-slate-400">vikram@sikhiya.com</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                <p className="font-medium text-slate-900 dark:text-white">Admin</p>
                <p className="text-slate-600 dark:text-slate-400">admin@sikhiya.com</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Password: password (for all)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
