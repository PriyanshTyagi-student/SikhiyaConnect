'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getAPIURL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function CourseDetailPage() {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    duration_hours: '',
    thumbnail: '',
  });

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user.role !== 'teacher' || user.teacherStatus !== 'approved') {
      router.push('/dashboard');
      return;
    }

    // Fetch course details
    if (token) {
      const fetchCourse = async () => {
        try {
          const apiUrl = getAPIURL();
          const res = await fetch(`${apiUrl}/teacher/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (!res.ok) throw new Error('Course not found');
          const data = await res.json();
          
          setCourse(data);
          setFormData({
            title: data.title,
            description: data.description,
            level: data.level,
            duration_hours: data.duration_hours.toString(),
            thumbnail: data.thumbnail || '',
          });
        } catch (err) {
          console.error('Failed to fetch course:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [user, token, router, isInitialized, courseId]);

  const handleUpdate = async () => {
    if (!token) return;

    try {
      const apiUrl = getAPIURL();
      const res = await fetch(`${apiUrl}/teacher/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration_hours),
        }),
      });

      if (!res.ok) throw new Error('Failed to update course');

      const updated = await res.json();
      setCourse(updated);
      setEditing(false);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course');
    }
  };

  const handleDelete = async () => {
    if (!token || !confirm('Are you sure you want to delete this course?')) return;

    try {
      const apiUrl = getAPIURL();
      const res = await fetch(`${apiUrl}/teacher/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete course');

      alert('Course deleted successfully!');
      router.push('/teacher');
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    }
  };

  if (!user || user.role !== 'teacher') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600 dark:text-slate-400">Loading course...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Link href="/teacher">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Course not found</p>
          </Card>
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
            <Link href="/teacher">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {editing ? 'Edit Course' : course.title}
            </h1>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Link href={`/teacher/courses/${courseId}/manage`}>
                  <Button type="button" variant="outline" className="gap-2">
                    📚 Manage Content
                  </Button>
                </Link>
                <Button type="button" onClick={() => setEditing(true)} variant="outline">
                  Edit
                </Button>
                <Button type="button" onClick={handleDelete} variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={() => setEditing(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="button" onClick={handleUpdate} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Course Details */}
        <Card className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Course Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course Description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <Input
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g., Beginner, Intermediate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    placeholder="Hours"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</h3>
                <p className="mt-1 text-slate-900 dark:text-white">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Level</h3>
                  <p className="mt-1 text-slate-900 dark:text-white">{course.level}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Duration</h3>
                  <p className="mt-1 text-slate-900 dark:text-white">{course.duration_hours} hours</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Created</h3>
                <p className="mt-1 text-slate-900 dark:text-white">
                  {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
