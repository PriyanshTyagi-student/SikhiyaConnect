'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ChevronRight, Download, MessageSquare } from 'lucide-react';
import type { Course, Lesson } from '@/lib/types';

interface LessonClientProps {
  course: Course;
}

export default function LessonClient({ course }: LessonClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson');

  const [currentLesson, setCurrentLesson] = useState<(Lesson & { moduleTitle: string; moduleId: string }) | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    // Find current lesson
    if (lessonId) {
      for (const module of course.modules) {
        const lesson = module.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          setCurrentLesson({ ...lesson, moduleTitle: module.title, moduleId: module.id });
          break;
        }
      }
    } else {
      // Default to first lesson
      const firstLesson = course.modules[0]?.lessons[0];
      if (firstLesson) {
        setCurrentLesson({ ...firstLesson, moduleTitle: course.modules[0].title, moduleId: course.modules[0].id });
      }
    }
  }, [user, router, course, lessonId]);

  if (!user) {
    return null;
  }

  if (!currentLesson) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Loading lesson...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentModuleIndex = course.modules.findIndex((m) => m.id === currentLesson.moduleId);
  const currentLessonIndex = course.modules[currentModuleIndex].lessons.findIndex((l) => l.id === currentLesson.id);

  let nextLesson: Lesson | null = null;
  if (currentLessonIndex < course.modules[currentModuleIndex].lessons.length - 1) {
    nextLesson = course.modules[currentModuleIndex].lessons[currentLessonIndex + 1];
  } else if (currentModuleIndex < course.modules.length - 1) {
    nextLesson = course.modules[currentModuleIndex + 1].lessons[0];
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:underline">Courses</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/courses/${course.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{course.title}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-600 dark:text-slate-400">{currentLesson.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Placeholder */}
            <Card className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center text-white text-center p-8 border-slate-700">
              <div>
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold mb-2">{currentLesson.title}</h3>
                <p className="text-slate-300 mb-4">{currentLesson.duration} minutes</p>
                <Button size="lg" className="gap-2">
                  ▶ Play Video
                </Button>
              </div>
            </Card>

            {/* Lesson Info */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Module</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{currentLesson.moduleTitle}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{currentLesson.title}</h2>
                <p className="text-slate-600 dark:text-slate-400">{currentLesson.description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Download Resources
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <MessageSquare className="w-4 h-4" />
                  Discuss
                </Button>
              </div>

              {/* Mark Complete */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Mark this lesson as completed
                  </span>
                </label>

                {nextLesson && (
                  <Link href={`?lesson=${nextLesson.id}`}>
                    <Button className="w-full gap-2">
                      Next Lesson: {nextLesson.title}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}

                {!nextLesson && (
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full gap-2">
                      Back to Course
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Course Progress */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-800 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Course Content</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{module.title}</h4>
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`?lesson=${lesson.id}`}
                          className={`block p-2 rounded-lg text-sm transition-colors ${
                            lesson.id === currentLesson.id
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {lesson.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
