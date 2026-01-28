'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

export function TeacherApprovalListener() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [previousStatus, setPreviousStatus] = useState<string | undefined>();

  useEffect(() => {
    if (user?.role === 'teacher' && user?.teacherStatus) {
      // Check if status changed from pending to approved
      if (previousStatus === 'pending' && user.teacherStatus === 'approved') {
        toast({
          title: 'Congratulations!',
          description: 'Your teacher account has been approved. You can now access the teacher dashboard.',
        });
        // Redirect to teacher dashboard
        setTimeout(() => {
          router.push('/teacher');
        }, 2000);
      }

      // Check if status changed to rejected
      if (previousStatus === 'pending' && user.teacherStatus === 'rejected') {
        toast({
          title: 'Application Rejected',
          description: 'Your teacher application has been rejected. Please contact support for more information.',
          variant: 'destructive',
        });
      }

      setPreviousStatus(user.teacherStatus);
    }
  }, [user?.teacherStatus, previousStatus, toast, router, user?.role]);

  return null;
}
