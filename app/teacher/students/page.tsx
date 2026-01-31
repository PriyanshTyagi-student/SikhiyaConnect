'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, Mail, BookOpen } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  board?: string;
  student_class?: string;
  enrolledCourses?: number;
}

export default function TeacherStudentsPage() {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role !== 'teacher' || user.teacher_status !== 'approved') {
      router.push('/dashboard');
      return;
    }

    // Fetch students enrolled in teacher's courses
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/teacher/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch students');
          return res.json();
        })
        .then(data => {
          setStudents(data.students || []);
          setFilteredStudents(data.students || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch students:', err);
          setLoading(false);
        });
    }
  }, [user, token, router, isInitialized]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        student =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.board?.toLowerCase().includes(query) ||
          student.student_class?.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Students
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Students enrolled in your courses
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Students</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {students.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Enrollments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {students.reduce((sum, s) => sum + (s.enrolledCourses || 0), 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Filtered Results</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {filteredStudents.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, email, board, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Students List */}
        {loading ? (
          <Card className="p-8">
            <p className="text-center text-slate-600 dark:text-slate-400">Loading students...</p>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {searchQuery ? 'No students found matching your search' : 'No students enrolled yet'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </div>
                      {student.board && student.student_class && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {student.board} Board • Class {student.student_class}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {student.enrolledCourses || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
