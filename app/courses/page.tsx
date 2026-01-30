'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockCourses, getCoursesByBoardAndClass } from '@/lib/mock-data';
import Link from 'next/link';
import { Search, Users, Clock, TrendingUp } from 'lucide-react';

export default function CoursesPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [filteredCourses, setFilteredCourses] = useState(Object.values(mockCourses));

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }
  }, [user, isInitialized, router]);

  useEffect(() => {
    // Start with courses available for this student's board and class
    let filtered = getCoursesByBoardAndClass(user?.board, user?.student_class);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedLevel, user?.board, user?.student_class]);

  if (!isInitialized || !user) {
    return null;
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Explore Courses</h1>
          <p className="text-slate-600 dark:text-slate-400">Discover and enroll in amazing courses</p>
          {user?.board && user?.student_class && (
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              📚 {user.board} Board • Class {user.student_class} • {filteredCourses.length} courses available
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search courses by title or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel(level as any)}
                className="capitalize"
              >
                {level === 'all' ? 'All Levels' : level}
              </Button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                  <div className="text-5xl mb-4">{course.thumbnail || '📚'}</div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                    {course.description}
                  </p>

                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{course.studentCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {course.modules.length} modules
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-600 dark:text-slate-400">By {course.teacherName}</div>
                    <Button className="w-full" size="sm">
                      View Course
                    </Button>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">No courses found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
