'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, TrendingUp, MessageSquare, Plus } from 'lucide-react';
import { createTeacherCourse, getTeacherCourses, getTeacherDashboard } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function TeacherDashboardPage() {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    weeklyEnrollments: [] as { day: string; hours: number }[],
  });
  const [studentQuestions, setStudentQuestions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLevel, setNewLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [newDuration, setNewDuration] = useState(1);
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newTargetClass, setNewTargetClass] = useState('1-5');
  const [newTargetBoard, setNewTargetBoard] = useState('All');

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role !== 'teacher') {
      router.push('/dashboard');
      return;
    }

    // Check if teacher is approved
    if (user.teacherStatus !== 'approved') {
      router.push('/teacher/pending');
      return;
    }

    if (!token) {
      return;
    }

    const loadCourses = async () => {
      try {
        const [coursesResult, dashboardResult] = await Promise.all([
          getTeacherCourses(token),
          getTeacherDashboard(token),
        ]);
        setTeacherCourses(coursesResult.courses || []);
        setDashboardStats({
          totalCourses: dashboardResult?.stats?.totalCourses ?? 0,
          totalStudents: dashboardResult?.stats?.totalStudents ?? 0,
          totalEnrollments: dashboardResult?.stats?.totalEnrollments ?? 0,
          weeklyEnrollments: dashboardResult?.weeklyEnrollments || [],
        });
        setStudentQuestions(dashboardResult?.questions || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load courses from database.',
          variant: 'destructive',
        });
      }
    };

    loadCourses();
  }, [user, token, isInitialized, router, toast]);

  if (!isInitialized || !user || user.role !== 'teacher') {
    return null;
  }

  const courseArray = teacherCourses;
  const totalStudents = dashboardStats.totalStudents || courseArray.reduce((sum, course) => sum + course.studentCount, 0);

  const handleCreateCourse = async () => {
    if (!token) {
      return;
    }

    if (!newTitle.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please enter a course title.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTeacherCourse(token, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        level: newLevel,
        duration: Number(newDuration) || 0,
        thumbnail: newThumbnail.trim() || undefined,
        target_class: newTargetClass,
        target_board: newTargetBoard,
      });
      setTeacherCourses((prev) => [result.course, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewLevel('beginner');
      setNewDuration(1);
      setNewThumbnail('');
      setNewTargetClass('1-5');
      setNewTargetBoard('All');
      setIsCreating(false);
      toast({
        title: 'Course created',
        description: 'Your course has been added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create course.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👨‍🏫
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your courses and track student progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Courses</span>
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{courseArray.length}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Students</span>
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalStudents}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Enrollments</span>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{dashboardStats.totalEnrollments}</p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Pending Questions</span>
              <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{studentQuestions.length}</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h2>
                <Button size="sm" className="gap-2" onClick={() => setIsCreating((prev) => !prev)}>
                  <Plus className="w-4 h-4" />
                  {isCreating ? 'Close' : 'New Course'}
                </Button>
              </div>

              {isCreating && (
                <Card className="p-6 border-slate-200 dark:border-slate-800 mb-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="course-title">Title</Label>
                      <Input
                        id="course-title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Enter course title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-description">Description</Label>
                      <Input
                        id="course-description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Enter course description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-level">Level</Label>
                      <select
                        id="course-level"
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                        className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-duration">Duration (hours)</Label>
                      <Input
                        id="course-duration"
                        type="number"
                        min={1}
                        value={newDuration}
                        onChange={(e) => setNewDuration(Number(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-thumbnail">Thumbnail (emoji or URL)</Label>
                      <Input
                        id="course-thumbnail"
                        value={newThumbnail}
                        onChange={(e) => setNewThumbnail(e.target.value)}
                        placeholder="📚"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="course-target-class">Target Classes</Label>
                        <select
                          id="course-target-class"
                          value={newTargetClass}
                          onChange={(e) => setNewTargetClass(e.target.value)}
                          className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm"
                        >
                          <option value="1-5">Classes 1-5</option>
                          <option value="6-8">Classes 6-8</option>
                          <option value="9-10">Classes 9-10</option>
                          <option value="11-12">Classes 11-12</option>
                          <option value="All">All Classes</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="course-target-board">Board</Label>
                        <select
                          id="course-target-board"
                          value={newTargetBoard}
                          onChange={(e) => setNewTargetBoard(e.target.value)}
                          className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm"
                        >
                          <option value="PSEB">PSEB</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="All">All Boards</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateCourse} disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? 'Creating...' : 'Create Course'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {courseArray.length === 0 ? (
                <Card className="p-8 border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-slate-600 dark:text-slate-400">No courses yet. Create your first course to get started!</p>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Classes 1-5 */}
                  {courseArray.filter(c => c.target_class === '1-5' || c.target_class === 'All').length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">📖 Classes 1-5 (Primary)</h3>
                      <div className="space-y-3">
                        {courseArray.filter(c => c.target_class === '1-5').map((course) => (
                          <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                            <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{course.thumbnail || '📚'}</div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                                    <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                                    <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                                    {course.target_board && course.target_board !== 'All' && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="shrink-0">Edit</Button>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Classes 6-8 */}
                  {courseArray.filter(c => c.target_class === '6-8').length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">📘 Classes 6-8 (Middle)</h3>
                      <div className="space-y-3">
                        {courseArray.filter(c => c.target_class === '6-8').map((course) => (
                          <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                            <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{course.thumbnail || '📚'}</div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                                    <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                                    <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                                    {course.target_board && course.target_board !== 'All' && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="shrink-0">Edit</Button>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Classes 9-10 */}
                  {courseArray.filter(c => c.target_class === '9-10').length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">📙 Classes 9-10 (Secondary)</h3>
                      <div className="space-y-3">
                        {courseArray.filter(c => c.target_class === '9-10').map((course) => (
                          <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                            <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{course.thumbnail || '📚'}</div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                                    <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                                    <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                                    {course.target_board && course.target_board !== 'All' && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="shrink-0">Edit</Button>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Classes 11-12 */}
                  {courseArray.filter(c => c.target_class === '11-12').length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">📕 Classes 11-12 (Senior)</h3>
                      <div className="space-y-3">
                        {courseArray.filter(c => c.target_class === '11-12').map((course) => (
                          <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                            <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{course.thumbnail || '📚'}</div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                                    <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                                    <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                                    {course.target_board && course.target_board !== 'All' && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="shrink-0">Edit</Button>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Classes */}
                  {courseArray.filter(c => c.target_class === 'All').length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">🌍 All Classes</h3>
                      <div className="space-y-3">
                        {courseArray.filter(c => c.target_class === 'All').map((course) => (
                          <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                            <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{course.thumbnail || '📚'}</div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                                  <div className="flex items-center gap-4 text-xs">
                                    <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                                    <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                                    <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                                    {course.target_board && course.target_board !== 'All' && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="shrink-0">Edit</Button>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Trend */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Weekly Enrollments</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dashboardStats.weeklyEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="day" stroke="currentColor" opacity={0.5} />
                  <YAxis stroke="currentColor" opacity={0.5} />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="#9333ea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Student Questions */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Questions</h3>
                <Link href="/discussions">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {studentQuestions.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">No questions yet.</p>
                ) : (
                  studentQuestions.map((question) => (
                    <Link key={question.id} href={`/discussions?id=${question.id}`}>
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{question.title}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                          <span>{question.repliesCount ?? question.replies?.length ?? 0} replies</span>
                          {!question.isResolved && (
                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                              Open
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
