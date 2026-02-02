'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, ChevronRight, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getAvailableCourses, enrollInCourse, getStudentEnrollments, unenrollFromCourse } from '@/lib/api'

interface CourseData {
  id: number
  title: string
  description: string
  level: string
  duration_hours: number
  thumbnail: string | null
  target_class: string
  target_board: string
  teacher_id: number
  teacher_name: string
  created_at: string
  status?: string
}

type Props = { courseId: string }

export default function CourseClient({ courseId }: Props) {
  const { user, token, isInitialized } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null) // 'pending', 'approved', 'rejected', 'active'

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    if (user.role !== 'student') {
      router.push('/dashboard')
      return
    }
  }, [user, isInitialized, router])

  useEffect(() => {
    if (!token || !courseId) {
      return
    }

    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch available courses
        const availableData = await getAvailableCourses(token)
        const foundCourse = availableData.courses?.find((c: CourseData) => c.id === parseInt(courseId))
        
        if (!foundCourse) {
          setError('Course not found')
          return
        }
        
        setCourse(foundCourse)
        
        // Check enrollment status
        try {
          const enrollmentsData = await getStudentEnrollments(token)
          const enrollment = enrollmentsData.courses?.find((c: any) => c.id === parseInt(courseId))
          if (enrollment) {
            setEnrollmentStatus(enrollment.status)
          }
        } catch (enrollErr) {
          console.log('Could not check enrollment status')
        }
      } catch (err) {
        console.error('Failed to fetch course:', err)
        setError(err instanceof Error ? err.message : 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [token, courseId])

  const handleRequestEnrollment = async () => {
    if (!course || !token) return

    try {
      setEnrolling(true)
      await enrollInCourse(token, course.id)
      setEnrollmentStatus('pending')
      toast({
        title: 'Request Sent',
        description: 'Your enrollment request has been sent to the teacher. You will be notified once approved.',
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send enrollment request'
      
      // Check for different error statuses
      if (errorMsg.includes('already requested') || errorMsg.includes('already enrolled') || errorMsg.includes('approved')) {
        if (errorMsg.includes('requested')) {
          setEnrollmentStatus('pending')
        } else if (errorMsg.includes('rejected')) {
          setEnrollmentStatus('rejected')
        } else {
          setEnrollmentStatus('approved')
        }
      }
      
      toast({
        title: 'Info',
        description: errorMsg,
        variant: 'default',
      })
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async () => {
    if (!course || !token) return

    try {
      setUnenrolling(true)
      await unenrollFromCourse(token, course.id)
      setEnrollmentStatus(null)
      toast({
        title: 'Success',
        description: 'You have successfully unenrolled from this course.',
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to unenroll'
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setUnenrolling(false)
    }
  }

  if (!isInitialized || !user) {
    return null
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
    )
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{error || 'Course not found'}</p>
          <Link href="/courses">
            <Button variant="outline" className="mt-6">Back to Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const canAccessLearning = enrollmentStatus === 'approved' || enrollmentStatus === 'active'

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
                <div className="text-5xl">📚</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{course.description || 'No description available'}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="capitalize">{course.level}</span>
                    </div>
                    {course.target_board && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span>{course.target_board}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Content Info */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About This Course</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Learn from {course.teacher_name}. This course is designed for students in {course.target_class}.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">What you'll learn:</p>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>✓ Course content and materials</li>
                    <li>✓ Video lessons and modules</li>
                    <li>✓ Learning resources and materials</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 border-slate-200 dark:border-slate-800 sticky top-24">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Instructor</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{course.teacher_name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Level</p>
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">{course.level}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Duration</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{course.duration_hours} hours</p>
                </div>

                {course.target_class && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Target Class</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{course.target_class}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  {enrollmentStatus === null && (
                    <Button 
                      className="w-full" 
                      onClick={handleRequestEnrollment}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Sending Request...' : 'Request to Enroll'}
                    </Button>
                  )}

                  {enrollmentStatus === 'pending' && (
                    <Button 
                      className="w-full bg-yellow-600 hover:bg-yellow-700" 
                      disabled
                    >
                      ⏳ Request Pending
                    </Button>
                  )}

                  {enrollmentStatus === 'rejected' && (
                    <div>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700" 
                        disabled
                      >
                        ❌ Request Rejected
                      </Button>
                      <Button 
                        className="w-full mt-2" 
                        onClick={handleRequestEnrollment}
                        disabled={enrolling}
                        variant="outline"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {(enrollmentStatus === 'approved' || enrollmentStatus === 'active') && (
                    <>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => router.push(`/courses/${courseId}/learn`)}
                      >
                        ✓ Start Learning
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="destructive"
                        onClick={handleUnenroll}
                        disabled={unenrolling}
                      >
                        {unenrolling ? 'Unenrolling...' : 'Unenroll'}
                      </Button>
                    </>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const shareText = `Check out "${course.title}" on Sikhiya Connect!`
                      if (navigator.share) {
                        navigator.share({
                          title: course.title,
                          text: shareText,
                          url: window.location.href,
                        }).catch(() => {})
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(`${shareText} ${window.location.href}`)
                        toast({
                          title: 'Link Copied',
                          description: 'Share link copied to clipboard!',
                        })
                      }
                    }}
                  >
                    Share Course
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
