'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Check, X, Clock, AlertCircle, Users, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { approveTeacherAdmin, deleteAdminUser, getAdminStudents, getAdminTeachers, rejectTeacherAdmin, resetAdminUserPassword } from '@/lib/api';

export default function AdminDashboard() {
  const { user, token, logout, isInitialized } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingTeachers, setPendingTeachers] = useState<User[]>([]);
  const [approvedTeachers, setApprovedTeachers] = useState<User[]>([]);
  const [rejectedTeachers, setRejectedTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Demo login: admin@sikhiya.com / password
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user || user.role !== 'admin') {
      router.push('/auth/sign-in');
      return;
    }

    loadAllData();
  }, [user, token, isInitialized, router]);

  const loadAllData = async () => {
    if (!token) {
      return;
    }

    try {
      const [studentsResult, pendingResult, approvedResult, rejectedResult] = await Promise.all([
        getAdminStudents(token),
        getAdminTeachers(token, 'pending'),
        getAdminTeachers(token, 'approved'),
        getAdminTeachers(token, 'rejected'),
      ]);
      setStudents(studentsResult.students || []);
      setPendingTeachers(pendingResult.teachers || []);
      setApprovedTeachers(approvedResult.teachers || []);
      setRejectedTeachers(rejectedResult.teachers || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data from database.',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (teacherId: string) => {
    setIsLoading(true);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }
      await approveTeacherAdmin(token, teacherId);
      await loadAllData();
      toast({
        title: 'Teacher Approved',
        description: 'Teacher has been approved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve teacher.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (teacherId: string) => {
    setIsLoading(true);
    try {
      if (!token) {
        throw new Error('Missing admin token');
      }
      await rejectTeacherAdmin(token, teacherId);
      await loadAllData();
      toast({
        title: 'Teacher Rejected',
        description: 'Teacher application has been rejected.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject teacher.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this user? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminUser(token, userId);
      setStudents((prev) => prev.filter((s) => String(s.id) !== String(userId)));
      toast({
        title: 'User deleted',
        description: 'The user has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm('Reset this user\'s password? A new temporary password will be generated.');
    if (!confirmed) {
      return;
    }

    try {
      const result = await resetAdminUserPassword(token, userId);
      toast({
        title: 'Password reset',
        description: `Temporary password: ${result.temporaryPassword}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password.',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = approvedTeachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Complete Control Panel</p>
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{students.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{rejectedTeachers.length}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="border-slate-200 dark:border-slate-800">
          <div className="p-8">
            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Pending</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Teachers</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Students</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Pending Applications Tab */}
              <TabsContent value="pending" className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Pending Teacher Applications
                </h2>

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
              </TabsContent>

              {/* Approved Teachers Tab */}
              <TabsContent value="approved" className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Approved Teachers</h2>
                  <Input
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {filteredTeachers.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No approved teachers found.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredTeachers.map((teacher) => (
                      <div key={teacher.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl">
                            {teacher.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{teacher.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{teacher.email}</p>
                            {teacher.qualifications && (
                              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">📚 {teacher.qualifications}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 text-xs font-medium rounded-full">
                              ✓ Approved
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students" className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Students</h2>
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No students found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Board</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Class</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{student.avatar}</span>
                                <span className="font-medium text-slate-900 dark:text-white">{student.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.email}</td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.board || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{student.student_class || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Active
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResetPassword(String(student.id))}
                                >
                                  Reset Password
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(String(student.id))}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Admin Settings</h2>

                <Card className="border-slate-200 dark:border-slate-800 p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Admin Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                          <p className="text-slate-900 dark:text-white mt-1">{user?.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                          <p className="text-slate-900 dark:text-white mt-1">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Role</label>
                          <p className="text-slate-900 dark:text-white mt-1 capitalize">{user?.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Quick Stats</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {students.length + approvedTeachers.length + pendingTeachers.length}
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Platform Status</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">🟢 Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 p-6 bg-amber-50 dark:bg-amber-900/10">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">Security Notice</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        This is a development admin panel. For production use, implement proper:
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                          <li>Two-factor authentication (2FA)</li>
                          <li>Password hashing and salting</li>
                          <li>Audit logging for all admin actions</li>
                          <li>Role-based access control (RBAC)</li>
                        </ul>
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </main>
    </div>
  );
}
