'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Play, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAvailableCourses, getStudentEnrollments } from '@/lib/api';

interface CourseData {
  id: number;
  title: string;
  description: string;
  level: string;
  duration_hours: number;
  thumbnail: string | null;
  target_class: string;
  target_board: string;
  teacher_id: number;
  teacher_name: string;
  created_at: string;
}

interface LessonClientProps {
  courseId: string;
}

export default function LessonClient({ courseId }: LessonClientProps) {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role !== 'student') {
      router.push('/dashboard');
      return;
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (!token || !courseId) {
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAvailableCourses(token);
        const foundCourse = data.courses?.find((c: CourseData) => c.id === parseInt(courseId));

        if (!foundCourse) {
          setError('Course not found');
          return;
        }

        setCourse(foundCourse);

        // Check enrollment status
        try {
          const enrollmentsData = await getStudentEnrollments(token);
          const enrollment = enrollmentsData.courses?.find((c: any) => c.id === parseInt(courseId));
          if (enrollment) {
            setEnrollmentStatus(enrollment.status);
          } else {
            setEnrollmentStatus(null);
          }
        } catch (enrollErr) {
          console.log('Could not check enrollment status');
          setEnrollmentStatus(null);
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [token, courseId]);

  if (!isInitialized || !user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'Course not found'}</p>
          <Link href="/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Check if student has approved/active enrollment
  const hasAccess = enrollmentStatus === 'approved' || enrollmentStatus === 'active';

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Lock className="w-16 h-16 mx-auto text-yellow-600 dark:text-yellow-500 mb-4" />
          <p className="text-slate-900 dark:text-white text-xl font-semibold mb-2">Access Restricted</p>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {enrollmentStatus === 'pending' && 'Your enrollment request is pending teacher approval. You can start learning once approved.'}
            {enrollmentStatus === 'rejected' && 'Your enrollment request was rejected by the teacher.'}
            {!enrollmentStatus && 'You need to request enrollment first to access this course.'}
          </p>
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">by {course.teacher_name}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Video Player Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Video Player Placeholder */}
            <Card className="aspect-video bg-slate-900 dark:bg-slate-800 flex items-center justify-center border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Video player coming soon</p>
                <p className="text-sm text-slate-500 mt-2">Teacher will upload video content here</p>
              </div>
            </Card>

            {/* Course Content */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Course Overview</h2>
                  <p className="text-slate-600 dark:text-slate-400">{course.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{course.duration_hours} hours</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Level</p>
                    <p className="font-semibold text-slate-900 dark:text-white capitalize">{course.level}</p>
                  </div>
                  {course.target_class && (
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Class</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{course.target_class}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Content List */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Course Content</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Module 1</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Coming soon - Teacher to add</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Module 2</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Coming soon - Teacher to add</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Module 3</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Coming soon - Teacher to add</p>
                </div>
              </div>
            </Card>

            {/* Progress */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Your Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Completion</span>
                  <span className="font-bold text-slate-900 dark:text-white">0%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Just started!</p>
              </div>
            </Card>

            {/* Download Resources */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h3>
              <Button variant="outline" className="w-full" disabled>
                Download Materials
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Resources will be available when the teacher uploads them
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
