'use client';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockCourses, mockStudentAnalytics, mockDiscussions, getCoursesByBoardAndClass } from '@/lib/mock-data';
import { getDashboard } from '@/lib/api';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, BookOpen, Users, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user, token, isInitialized } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<typeof mockCourses>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role === 'teacher') {
      router.push('/teacher');
      return;
    }

    // Fetch dashboard data from API
    if (token) {
      getDashboard(token)
        .then(data => {
          setDashboardData(data);
          // Update progress from API data if available
          if (data.courseProgress) {
            setProgress(data.courseProgress);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch dashboard:', err);
          setLoading(false);
        });
    }
  }, [user, token, router]);

  if (!user || user.role !== 'student') {
    return null;
  }

  // Get courses available for this student's board and class
  const availableCourses = getCoursesByBoardAndClass(user.board, user.student_class);
  
  // Use dashboardData enrolled courses if available, otherwise show all available courses for their class
  const courseArray = dashboardData?.enrolledCourses ? 
    dashboardData.enrolledCourses.map((id: string) => mockCourses[id as keyof typeof mockCourses]).filter(Boolean) :
    availableCourses;
  const recentDiscussions = Object.values(mockDiscussions).slice(0, 3);
  const isEmpty = courseArray.length === 0;
  const stats = dashboardData?.stats || {
    coursesEnrolled: 0,
    hoursLearned: 0,
    currentStreak: 0,
    completedCourses: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section with Stats */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {t('dashboard.welcome')}, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('dashboard.greeting')}</p>
          {user.board && user.student_class && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              📚 {user.board} Board • Class {user.student_class}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('dashboard.coursesEnrolled')}</span>
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.coursesEnrolled}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('dashboard.hoursLearned')}</span>
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.hoursLearned}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('dashboard.currentStreak')}</span>
              <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.currentStreak}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">days</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t('dashboard.completed')}</span>
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completedCourses}</p>
          </Card>
        </div>

        {isEmpty && !loading && (
          <Card className="p-8 border-slate-200 dark:border-slate-800 text-center">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Welcome to your new dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              You don’t have any courses yet. Start by exploring available courses.
            </p>
            <div className="mt-6">
              <Link href="/courses">
                <Button>Explore Courses</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        {!isEmpty && (
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.myCourses')}</h2>
                <Link href="/courses">
                  <Button variant="outline" size="sm">{t('dashboard.viewAll')}</Button>
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
                              <span className="text-slate-600 dark:text-slate-400">{t('dashboard.progress')}</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{progress[course.id]}%</span>
                            </div>
                            <Progress value={progress[course.id] || 0} className="h-2" />
                          </div>
                        </div>
                        <Button size="sm" variant="outline">{t('dashboard.continue')}</Button>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.weeklyActivity')}</h3>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.recentQuestions')}</h3>
                <Link href="/discussions">
                  <Button variant="outline" size="sm">{t('dashboard.viewAll')}</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentDiscussions.map((discussion) => (
                  <Link key={discussion.id} href={`/discussions?id=${discussion.id}`}>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{discussion.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{discussion.replies.length} {t('dashboard.replies')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
