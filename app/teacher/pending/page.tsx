'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function TeacherPendingPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // If user is not a teacher or status is not pending, redirect
    if (!user || user.role !== 'teacher') {
      router.push('/');
      return;
    }

    if (user.teacherStatus === 'approved') {
      router.push('/teacher');
      return;
    }

    if (user.teacherStatus === 'rejected') {
      router.push('/');
      return;
    }
  }, [user, isInitialized, router]);

  const handleLogout = () => {
    router.push('/auth/sign-in');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Status Card */}
        <Card className="border-slate-200 dark:border-slate-800 mb-8">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Application Under Review
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Your teacher account is pending approval
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <p className="text-amber-900 dark:text-amber-100 text-sm">
                <strong>Current Status:</strong> Pending Approval
              </p>
              <p className="text-amber-900 dark:text-amber-100 text-sm mt-2">
                <strong>Applied on:</strong> {user?.createdAt?.toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="border-slate-200 dark:border-slate-800 mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Review Process
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Application Submitted
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Your application has been successfully submitted to our admin team.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Verification & Review
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Our admin team will verify your qualifications and teaching experience.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Approval Decision
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    You&apos;ll receive an email notification once the review is complete.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Start Teaching
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Once approved, you can create courses and start teaching on Sikhiya Connect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="border-slate-200 dark:border-slate-800 mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              What Happens Next?
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How long does the review take?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Typically, our admin team reviews applications within 2-3 business days. You&apos;ll receive an email notification as soon as your application is reviewed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  What are the approval criteria?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  We look for teachers with relevant expertise, good communication skills, and a commitment to quality education. Your qualifications, experience, and teaching approach are evaluated.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  What if my application is rejected?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  If rejected, you&apos;ll receive feedback explaining the reason. You can reapply after addressing the feedback and improving your profile.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Can I check my application status?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Yes, your current status is shown on this page. You can also check your email for updates from our admin team.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 dark:text-blue-100 text-sm">
              <strong>Note:</strong> You cannot access teacher features until your account is approved. You can still use student features if you have an approved student account.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={handleLogout}>
            Go Back to Home
          </Button>
          <Button
            onClick={() => {
              // Refresh to check for updates
              router.refresh();
            }}
          >
            Check Status
          </Button>
        </div>
      </div>
    </div>
  );
}
