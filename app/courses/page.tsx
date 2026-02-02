'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvailableCourses } from '@/lib/api';
import Link from 'next/link';
import { Search, Users, Clock, TrendingUp, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
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

export default function CoursesPage() {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
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

    // Only students can access this page
    if (user.role !== 'student') {
      router.push('/dashboard');
      return;
    }
  }, [user, isInitialized, router]);

  // Fetch courses from API
  useEffect(() => {
    if (!token || !user || user.role !== 'student') {
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAvailableCourses(token);
        setAllCourses(data.courses || []);
        setFilteredCourses(data.courses || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        toast({
          title: 'Error',
          description: 'Failed to load courses. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token, user, toast]);

  // Filter courses based on search and level
  useEffect(() => {
    let filtered = [...allCourses];

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
  }, [searchTerm, selectedLevel, allCourses]);

  if (!isInitialized || !user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Explore Courses</h1>
          <p className="text-slate-600 dark:text-slate-400">Discover and enroll in amazing courses</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            📚 {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available for you
          </p>
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
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">{course.description || 'No description available'}</p>
                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="text-xs">{course.target_class}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      {course.target_board && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {course.target_board}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-slate-600 dark:text-slate-400">By {course.teacher_name}</div>
                    <Button className="w-full" size="sm">View Course</Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No courses found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your filters to find more courses.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
