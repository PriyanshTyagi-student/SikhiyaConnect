'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStudentAnalytics, mockTeacherAnalytics } from '@/lib/mock-data';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AnalyticsPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role === 'student') {
      setAnalytics(mockStudentAnalytics);
    } else {
      setAnalytics(mockTeacherAnalytics);
    }
  }, [user, isInitialized, router]);

  if (!isInitialized || !user || !analytics) {
    return null;
  }

  const isStudent = user.role === 'student';

  const pieData = isStudent
    ? [
        { name: 'Completed', value: 1 },
        { name: 'In Progress', value: 2 },
      ]
    : [
        { name: 'Active', value: 3 },
        { name: 'Draft', value: 0 },
      ];

  const COLORS = ['#3b82f6', '#8b5cf6'];

  const studentGoals = [
    { goal: 'Complete 3 courses', progress: 33 },
    { goal: 'Learn 50 hours', progress: 68 },
    { goal: 'Maintain 30-day streak', progress: 23 },
  ];

  const teacherGoals = [
    { goal: 'Reach 1000 students', progress: 79 },
    { goal: 'Create 5 courses', progress: 60 },
    { goal: 'Get 5-star rating', progress: 88 },
  ];

  const goals = isStudent ? studentGoals : teacherGoals;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isStudent ? 'Track your learning progress' : 'Monitor your teaching impact'}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          {isStudent ? (
            <>
              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Hours</span>
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalHoursLearned}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">hours learned</p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Courses</span>
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalCoursesEnrolled}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">enrolled</p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Completed</span>
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.coursesCompleted}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">courses</p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Streak</span>
                  <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.currentStreak}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">days</p>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Courses</span>
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalCourses}</p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Students</span>
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalStudents}</p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Enrollments</span>
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.totalEnrollments}</p>
              </Card>

              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Avg Students</span>
                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Math.round(analytics.totalStudents / analytics.totalCourses)}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">per course</p>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                {isStudent ? 'Weekly Learning Hours' : 'Weekly Enrollments'}
              </h3>
              {isMobile ? (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {(isStudent ? mockStudentAnalytics.weeklyData : mockTeacherAnalytics.weeklyEnrollments).map((item) => (
                    <div key={item.day} className="flex items-center justify-between">
                      <span>{item.day}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.hours}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={isStudent ? mockStudentAnalytics.weeklyData : mockTeacherAnalytics.weeklyEnrollments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="day" stroke="currentColor" opacity={0.5} />
                    <YAxis stroke="currentColor" opacity={0.5} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name={isStudent ? 'Hours Learned' : 'New Enrollments'}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      isAnimationActive={!isMobile}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                {isStudent ? 'Course Status' : 'Course Status'}
              </h3>
              {isMobile ? (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <span>{entry.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label dataKey="value" isAnimationActive={!isMobile}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                {isStudent ? 'Time by Course' : 'Students by Course'}
              </h3>
              {isMobile ? (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {[
                    { name: 'Web Development', value: isStudent ? 12 : 342 },
                    { name: 'React Mastery', value: isStudent ? 8 : 156 },
                    { name: 'DSA', value: isStudent ? 14 : 289 },
                  ].map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <span>{entry.name}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Web Development', value: isStudent ? 12 : 342 },
                      { name: 'React Mastery', value: isStudent ? 8 : 156 },
                      { name: 'DSA', value: isStudent ? 14 : 289 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="name" stroke="currentColor" opacity={0.5} />
                    <YAxis stroke="currentColor" opacity={0.5} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" name={isStudent ? 'Hours' : 'Students'} isAnimationActive={!isMobile} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Goals Section */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {isStudent ? 'Learning Goals' : 'Teaching Goals'}
          </h3>
          <div className="space-y-4">
            {goals.map((item) => (
              <div key={item.goal}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900 dark:text-white">{item.goal}</p>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.progress}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
