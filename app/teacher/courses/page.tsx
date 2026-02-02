'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAPIURL } from '@/lib/api';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  target_class?: string;
  target_board?: string;
  studentCount: number;
  modules?: any[];
}

export default function TeacherCoursesPage() {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user || user.role !== 'teacher') {
      router.push('/auth/sign-in');
      return;
    }

    if (token) {
      fetchCourses();
    }
  }, [user, token, isInitialized, router]);

  const fetchCourses = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const apiUrl = await getAPIURL();
      const response = await fetch(`${apiUrl}/teacher/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('API Error:', response.status, error);
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/teacher">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage all your courses and content
            </p>
          </div>
          <Link href="/teacher">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Course
            </Button>
          </Link>
        </div>

        {/* Courses by Class */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading courses...</p>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No courses yet. Create your first course!</p>
            <Link href="/teacher">
              <Button>Create Course</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Classes 1-5 */}
            {courses.filter(c => c.target_class === '1-5').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  📖 Classes 1-5 (Primary)
                </h2>
                <div className="space-y-3">
                  {courses.filter(c => c.target_class === '1-5').map((course) => (
                    <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                      <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{course.thumbnail || '📚'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                              <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                              <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                              {course.target_board && course.target_board !== 'All' && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0">View</Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Classes 6-8 */}
            {courses.filter(c => c.target_class === '6-8').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  📘 Classes 6-8 (Middle)
                </h2>
                <div className="space-y-3">
                  {courses.filter(c => c.target_class === '6-8').map((course) => (
                    <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                      <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{course.thumbnail || '📚'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                              <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                              <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                              {course.target_board && course.target_board !== 'All' && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0">View</Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Classes 9-10 */}
            {courses.filter(c => c.target_class === '9-10').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  📙 Classes 9-10 (Secondary)
                </h2>
                <div className="space-y-3">
                  {courses.filter(c => c.target_class === '9-10').map((course) => (
                    <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                      <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{course.thumbnail || '📚'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                              <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                              <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                              {course.target_board && course.target_board !== 'All' && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0">View</Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Classes 11-12 */}
            {courses.filter(c => c.target_class === '11-12').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  📕 Classes 11-12 (Senior)
                </h2>
                <div className="space-y-3">
                  {courses.filter(c => c.target_class === '11-12').map((course) => (
                    <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                      <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{course.thumbnail || '📚'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                              <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                              <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                              {course.target_board && course.target_board !== 'All' && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0">View</Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Classes */}
            {courses.filter(c => c.target_class === 'All').length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  🌍 All Classes
                </h2>
                <div className="space-y-3">
                  {courses.filter(c => c.target_class === 'All').map((course) => (
                    <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                      <Card className="p-4 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{course.thumbnail || '📚'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span><span className="text-slate-600 dark:text-slate-400">Students:</span> <span className="font-semibold">{course.studentCount}</span></span>
                              <span><span className="text-slate-600 dark:text-slate-400">Modules:</span> <span className="font-semibold">{course.modules?.length || 0}</span></span>
                              <span className="capitalize"><span className="text-slate-600 dark:text-slate-400">Level:</span> <span className="font-semibold">{course.level}</span></span>
                              {course.target_board && course.target_board !== 'All' && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{course.target_board}</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0">View</Button>
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
    </DashboardLayout>
  );
}
