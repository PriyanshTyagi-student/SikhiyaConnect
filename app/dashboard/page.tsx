'use client';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockStudentAnalytics } from '@/lib/mock-data';
import { getDashboard, getStudentEnrollments, waitForAPIInit } from '@/lib/api';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, BookOpen, Users, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user, token, isInitialized } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const fetchData = async () => {
        try {
          // Wait for API to be initialized
          await waitForAPIInit();
          
          const [dashData, enrollData] = await Promise.all([
            getDashboard(token),
            getStudentEnrollments(token)
          ]);
          
          setDashboardData(dashData);
          
          // Use actual enrolled courses from API
          if (enrollData?.courses && Array.isArray(enrollData.courses)) {
            setEnrolledCourses(enrollData.courses);
          }
          
          // Update progress from API data if available
          if (dashData?.courseProgress) {
            setProgress(dashData.courseProgress);
          }
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch dashboard:', err);
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
          setLoading(false);
        }
      };
      
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, token, router, isInitialized]);

  if (!user || user.role !== 'student') {
    return null;
  }

  // Use enrolled courses from API
  const courseArray = enrolledCourses || [];
  const isEmpty = courseArray.length === 0;
  const stats = dashboardData?.stats || {
    coursesEnrolled: enrolledCourses.length,
    hoursLearned: 0,
    currentStreak: 0,
    completedCourses: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-red-600 dark:text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Please make sure the backend server is running on port 8000.
                </p>
              </div>
            </div>
          </div>
        )}

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

            {/* Quick Actions */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore More Courses
                  </Button>
                </Link>
                <Link href="/discussions" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Ask Questions
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}
