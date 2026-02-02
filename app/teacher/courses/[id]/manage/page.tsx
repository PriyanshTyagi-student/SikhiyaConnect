'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Upload, Book } from 'lucide-react';
import Link from 'next/link';
import { getAPIURL } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Module {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  video_file?: string;
  duration_seconds: number;
}

interface Resource {
  id: number;
  title: string;
  file_type: string;
  size_mb: number;
}

export default function ManageCourseContentPage() {
  const { user, token, isInitialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules');

  const [showNewModule, setShowNewModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [showNewLesson, setShowNewLesson] = useState(false);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [uploadingFile, setUploadingFile] = useState(false);

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

    if (token) {
      const fetchData = async () => {
        try {
          const apiUrl = getAPIURL();
          const [courseData, modulesData, resourcesData] = await Promise.all([
            fetch(`${apiUrl}/teacher/courses/${courseId}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            }).then(r => r.json()),
            fetch(`${apiUrl}/teacher/courses/${courseId}/modules`, {
              headers: { 'Authorization': `Bearer ${token}` },
            }).then(r => r.json()).catch(() => ({ modules: [] })),
            fetch(`${apiUrl}/teacher/courses/${courseId}/resources`, {
              headers: { 'Authorization': `Bearer ${token}` },
            }).then(r => r.json()).catch(() => ({ resources: [] })),
          ]);
          
          setCourse(courseData);
          setModules(modulesData.modules || []);
          setResources(resourcesData.resources || []);
        } catch (err) {
          console.error('Failed to load course:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, token, isInitialized, courseId, router]);

  const handleAddModule = async () => {
    if (!token || !newModuleTitle.trim()) return;

    try {
      const apiUrl = getAPIURL();
      const res = await fetch(`${apiUrl}/teacher/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDesc,
        }),
      });

      if (!res.ok) throw new Error('Failed to create module');

      const data = await res.json();
      setModules([...modules, { id: data.id, title: data.title, description: data.description, lessons: [] }]);
      setNewModuleTitle('');
      setNewModuleDesc('');
      setShowNewModule(false);
    } catch (error) {
      console.error('Failed to add module:', error);
      alert('Failed to add module');
    }
  };

  const handleAddLesson = async () => {
    if (!token || !selectedModule || !newLessonTitle.trim()) return;

    const formData = new FormData();
    formData.append('title', newLessonTitle);
    if (videoFile) {
      formData.append('video', videoFile);
    }

    try {
      const apiUrl = getAPIURL();
      const res = await fetch(`${apiUrl}/teacher/courses/${courseId}/modules/${selectedModule}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to create lesson');

      const data = await res.json();
      setModules(modules.map(m => 
        m.id === selectedModule 
          ? { ...m, lessons: [...(m.lessons || []), data] }
          : m
      ));
      setNewLessonTitle('');
      setVideoFile(null);
      setShowNewLesson(false);
    } catch (error) {
      console.error('Failed to add lesson:', error);
      alert('Failed to add lesson');
    }
  };

  const handleUploadResource = async (file: File) => {
    if (!token) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = getAPIURL();
      const res = await fetch(`${apiUrl}/teacher/courses/${courseId}/resources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload resource');

      const data = await res.json();
      setResources([...resources, data.resource]);
      alert('Resource uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload resource:', error);
      alert('Failed to upload resource');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!token) return;

    try {
      const apiUrl = getAPIURL();
      const res = await fetch(`${apiUrl}/teacher/courses/${courseId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete resource');

      setResources(resources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    }
  };

  if (!user || user.role !== 'teacher') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600 dark:text-slate-400">Loading course content...</p>
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
            <Link href={`/teacher/courses/${courseId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{course?.title}</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage course content</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'modules'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            📚 Modules & Lessons
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'resources'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            📦 Resources
          </button>
        </div>

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <Button onClick={() => setShowNewModule(!showNewModule)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Module
            </Button>

            {showNewModule && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Module Title</label>
                    <Input
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="e.g., Introduction to Python"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={newModuleDesc}
                      onChange={(e) => setNewModuleDesc(e.target.value)}
                      placeholder="Module description (optional)"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddModule}>Create Module</Button>
                    <Button variant="outline" onClick={() => setShowNewModule(false)}>Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {modules.map((module) => (
                <Card key={module.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{module.title}</h3>
                    {module.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{module.description}</p>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="space-y-2 mb-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                    {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map((lesson) => (
                        <div key={lesson.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-3">
                          <Book className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                            {lesson.duration_seconds > 0 && (
                              <p className="text-xs text-slate-500">
                                Duration: {Math.floor(lesson.duration_seconds / 60)} min
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No lessons yet</p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedModule(module.id);
                      setShowNewLesson(!showNewLesson);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Lesson
                  </Button>

                  {showNewLesson && selectedModule === module.id && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Lesson Title</label>
                        <Input
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="e.g., Variables and Data Types"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Video File (MP4)</label>
                        <input
                          type="file"
                          accept="video/mp4,.mp4"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddLesson} disabled={!newLessonTitle.trim()}>
                          Add Lesson
                        </Button>
                        <Button variant="outline" onClick={() => setShowNewLesson(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Upload Course Resources</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Upload PDFs, ZIP files, mock tests, and other course materials. ZIP files will be extracted on-demand.
              </p>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8">
                <input
                  type="file"
                  accept=".zip,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => e.target.files?.[0] && handleUploadResource(e.target.files[0])}
                  disabled={uploadingFile}
                  className="w-full"
                />
                {uploadingFile && <p className="text-sm text-slate-600 mt-2">Uploading...</p>}
              </div>
            </Card>

            {resources.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Course Resources</h3>
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{resource.title}</p>
                        <p className="text-xs text-slate-500">
                          {resource.file_type.toUpperCase()} • {resource.size_mb.toFixed(2)}MB
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteResource(resource.id)}
                        className="gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
