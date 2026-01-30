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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BOARDS = [
  { value: 'PSEB', label: 'Punjab School Education Board (PSEB)' },
  { value: 'CBSE', label: 'Central Board of Secondary Education (CBSE)' },
  { value: 'ICSE', label: 'Indian Certificate of School Education (ICSE)' },
  { value: 'Other', label: 'Other' },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`,
}));

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [board, setBoard] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate student fields
    if (role === 'student' && (!board || !studentClass)) {
      toast({
        title: 'Missing Information',
        description: 'Please select your board and class',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, name, role, board, studentClass);
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
      // Redirect teachers to pending page, students to dashboard
      if (role === 'teacher') {
        router.push('/teacher/pending');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Join Sikhiya</h1>
            <p className="text-slate-600 dark:text-slate-400">Create an account to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

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

            <div className="space-y-3">
              <Label>I am a:</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">👩‍🎓 Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">👨‍🏫 Teacher</span>
                </label>
              </div>
            </div>

            {role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="board">Board</Label>
                  <Select value={board} onValueChange={setBoard} disabled={isLoading}>
                    <SelectTrigger id="board">
                      <SelectValue placeholder="Select your board" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARDS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select value={studentClass} onValueChange={setStudentClass} disabled={isLoading}>
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
