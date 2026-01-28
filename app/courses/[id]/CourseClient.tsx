
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Clock, Users, Award, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import type { Course } from '@/lib/types'

type Props = { course: Course }

export default function CourseClient({ course }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const [progress, setProgress] = useState(45)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:underline">Courses</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-600 dark:text-slate-400">{course.title}</span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="text-5xl">{course.thumbnail || '📚'}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{course.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{course.studentCount} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Award className="w-4 h-4" />
                      <span className="capitalize">{course.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Your Progress</h3>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{Math.floor((progress / 100) * totalLessons)} of {totalLessons} lessons completed</p>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="modules" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="modules" className="space-y-4">
                <div className="space-y-3">
                  {course.modules.map((module) => (
                    <Card
                      key={module.id}
                      className="border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    >
                      <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{module.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{module.lessons.length} lessons</p>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-slate-400 transition-transform ${expandedModule === module.id ? 'rotate-90' : ''}`}
                          />
                        </div>
                      </div>

                      {expandedModule === module.id && (
                        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                          {module.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/courses/${course.id}/learn?lesson=${lesson.id}`}
                            >
                              <div className="p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{lesson.duration} min</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  Play
                                </Button>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card className="p-6 border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400">
                  <p className="mb-4">Course resources and materials will be available here</p>
                  <Button variant="outline">Download Materials</Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 border-slate-200 dark:border-slate-800 sticky top-24">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Instructor</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{course.teacherName}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Started</p>
                  <p className="font-semibold text-slate-900 dark:text-white">Jan 15, 2024</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Course Content</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{course.modules.length} modules · {totalLessons} lessons</p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <Link href={`/courses/${course.id}/learn`}>
                    <Button className="w-full">Continue Learning</Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-transparent">Share Course</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
