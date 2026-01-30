'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setStudentProfile } from '@/lib/student-profile';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

const boards = [
  'Punjab School Education Board (PSEB)',
  'Other',
];

const classes = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

export default function StudentOnboardingPage() {
  const [board, setBoard] = useState<string>('');
  const [classLevel, setClassLevel] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContinue = () => {
    if (!board || !classLevel) {
      toast({
        title: 'Missing info',
        description: 'Please select your board and class.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setStudentProfile({
      email: user?.email || '',
      board,
      classLevel,
      createdAt: new Date().toISOString(),
    });

    setIsSaving(false);
    router.push('/dashboard');
  };

  if (!user) {
    router.push('/auth/sign-in');
    return null;
  }

  if (user.role !== 'student') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <Card className="w-full max-w-md p-8 border-slate-200 dark:border-slate-800">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tell us about you</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            We’ll personalize your learning dashboard.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Board</Label>
            <Select value={board} onValueChange={setBoard}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                {boards.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleContinue} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
