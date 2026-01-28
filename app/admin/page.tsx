'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Check, X, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

export default function AdminDashboard() {
  const { user, logout, getPendingTeachers, approveTeacher, rejectTeacher } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingTeachers, setPendingTeachers] = useState<User[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<User[]>([]);
  const [rejectedTeachers, setRejectedTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Demo login: admin@sikhiya.com / password
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/auth/sign-in');
      return;
    }

    loadTeachersData();
  }, [user, router]);

  const loadTeachersData = () => {
    const pending = getPendingTeachers();
    setPendingTeachers(pending);
  };

  const handleApprove = async (teacherId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    approveTeacher(teacherId);
    const approvedTeacher = pendingTeachers.find(t => t.id === teacherId);
    
    if (approvedTeacher) {
      setApprovedTeachers(prev => [...prev, approvedTeacher]);
      setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
    }

    toast({
      title: 'Teacher Approved',
      description: `${approvedTeacher?.name} has been approved as a teacher.`,
    });
    setIsLoading(false);
  };

  const handleReject = async (teacherId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    rejectTeacher(teacherId);
    const rejectedTeacher = pendingTeachers.find(t => t.id === teacherId);
    
    if (rejectedTeacher) {
      setRejectedTeachers(prev => [...prev, rejectedTeacher]);
      setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
    }

    toast({
      title: 'Teacher Rejected',
      description: `${rejectedTeacher?.name}'s application has been rejected.`,
      variant: 'destructive',
    });
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Teacher Approval System</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Pending Applications</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{pendingTeachers.length}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Approved Teachers</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{approvedTeachers.length}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Rejected Applications</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{rejectedTeachers.length}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Teachers Section */}
        <Card className="border-slate-200 dark:border-slate-800">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Pending Teacher Applications
              </h2>
            </div>

            {pendingTeachers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <AlertCircle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400">No pending applications at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg">
                            {teacher.avatar}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {teacher.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{teacher.email}</p>
                          </div>
                        </div>

                        {teacher.qualifications && (
                          <div className="mt-3 ml-13">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <strong>Qualifications:</strong> {teacher.qualifications}
                            </p>
                          </div>
                        )}

                        {teacher.bio && (
                          <div className="mt-2 ml-13">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <strong>Bio:</strong> {teacher.bio}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 ml-13">
                          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-xs font-medium rounded-full">
                            Applied on {teacher.createdAt?.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 md:flex-col lg:flex-row">
                        <Button
                          onClick={() => handleApprove(teacher.id)}
                          disabled={isLoading}
                          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                          onClick={() => handleReject(teacher.id)}
                          disabled={isLoading}
                          variant="destructive"
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Approved Teachers Section */}
        {approvedTeachers.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800 mt-8">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Approved Teachers
                </h2>
              </div>

              <div className="space-y-4">
                {approvedTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-900/30 flex items-center justify-center text-lg">
                        {teacher.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{teacher.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{teacher.email}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 text-xs font-medium rounded-full">
                        Approved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Rejected Teachers Section */}
        {rejectedTeachers.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800 mt-8">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Rejected Applications
                </h2>
              </div>

              <div className="space-y-4">
                {rejectedTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-900/30 flex items-center justify-center text-lg">
                        {teacher.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{teacher.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{teacher.email}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 text-xs font-medium rounded-full">
                        Rejected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
