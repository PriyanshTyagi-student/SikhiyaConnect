// User types
export type UserRole = 'student' | 'teacher' | 'admin';
export type TeacherStatus = 'approved' | 'pending' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  // Teacher approval fields
  teacherStatus?: TeacherStatus;
  bio?: string;
  qualifications?: string;
  // Student fields
  board?: string;
  student_class?: string;
}

// Course types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  resourceUrl?: string;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  teacherId: string;
  teacherName: string;
  modules: Module[];
  thumbnail?: string;
  createdAt: Date;
  studentCount: number;
  target_class?: string; // e.g., "1-5", "6-8", "9-10", "11-12", "All"
  target_board?: string; // e.g., "PSEB", "CBSE", "ICSE", "All"
}

// Progress types
export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  timeSpent: number; // in minutes
  completedAt?: Date;
}

export interface CourseProgress {
  courseId: string;
  completionPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  enrolledAt: Date;
  lastAccessedAt: Date;
  lessonProgress: LessonProgress[];
}

// Discussion types
export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: Date;
  likes: number;
  isUserLiked?: boolean;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Date;
  replies: DiscussionReply[];
  views: number;
  isResolved: boolean;
}

// Analytics types
export interface WeeklyStats {
  day: string;
  hours: number;
}

export interface StudentAnalytics {
  totalCoursesEnrolled: number;
  coursesCompleted: number;
  totalHoursLearned: number;
  currentStreak: number;
  weeklyData: WeeklyStats[];
}

export interface TeacherAnalytics {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  weeklyEnrollments: WeeklyStats[];
}
