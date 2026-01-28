'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockCourses, mockStudentAnalytics, mockDiscussions } from '@/lib/mock-data';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, BookOpen, Users, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<typeof mockCourses>({});
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role === 'teacher') {
      router.push('/teacher');
      return;
    }

    // Mock: Student has enrolled in first two courses
    setEnrolledCourses({
      course1: mockCourses.course1,
      course2: mockCourses.course2,
    });

    setProgress({
      course1: 65,
      course2: 30,
    });
  }, [user, router]);

  if (!user || user.role !== 'student') {
    return null;
  }

  const courseArray = Object.values(enrolledCourses);
  const recentDiscussions = Object.values(mockDiscussions).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section with Stats */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Keep up the great progress with your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Courses Enrolled</span>
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{courseArray.length}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Hours Learned</span>
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{mockStudentAnalytics.totalHoursLearned}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Current Streak</span>
              <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{mockStudentAnalytics.currentStreak}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">days</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Completed</span>
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{mockStudentAnalytics.coursesCompleted}</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h2>
                <Link href="/courses">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {courseArray.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{course.thumbnail || '📚'}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{course.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{course.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Progress</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{progress[course.id]}%</span>
                            </div>
                            <Progress value={progress[course.id] || 0} className="h-2" />
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Continue</Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Chart */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockStudentAnalytics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="day" stroke="currentColor" opacity={0.5} />
                  <YAxis stroke="currentColor" opacity={0.5} />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Recent Discussions */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Questions</h3>
                <Link href="/discussions">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentDiscussions.map((discussion) => (
                  <Link key={discussion.id} href={`/discussions?id=${discussion.id}`}>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{discussion.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{discussion.replies.length} replies</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
