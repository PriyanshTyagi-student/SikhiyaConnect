import { User, Course, DiscussionThread, StudentAnalytics, TeacherAnalytics } from './types';

// Mock users
export const mockUsers: Record<string, User> = {
  student1: {
    id: 'student1',
    email: 'priya@sikhiya.com',
    name: 'Priya Sharma',
    role: 'student',
    avatar: '👩‍🎓',
    createdAt: new Date('2024-01-15'),
  },
  teacher1: {
    id: 'teacher1',
    email: 'rajesh@sikhiya.com',
    name: 'Rajesh Kumar',
    role: 'teacher',
    avatar: '👨‍🏫',
    createdAt: new Date('2023-06-01'),
    teacherStatus: 'approved',
    bio: 'Experienced full-stack developer with 10+ years in the industry',
    qualifications: 'B.Tech Computer Science, Certified Trainer',
  },
  teacher2: {
    id: 'teacher2',
    email: 'aisha@sikhiya.com',
    name: 'Aisha Khan',
    role: 'teacher',
    avatar: '👩‍🏫',
    createdAt: new Date('2024-01-10'),
    teacherStatus: 'pending',
    bio: 'Data Science enthusiast and AI specialist',
    qualifications: 'M.S. Data Science, 5 years experience',
  },
  teacher3: {
    id: 'teacher3',
    email: 'vikram@sikhiya.com',
    name: 'Vikram Patel',
    role: 'teacher',
    avatar: '👨‍🏫',
    createdAt: new Date('2024-01-05'),
    teacherStatus: 'pending',
    bio: 'Mobile App Development Specialist',
    qualifications: 'B.Tech IT, AWS Certified Developer',
  },
  admin1: {
    id: 'admin1',
    email: 'admin@sikhiya.com',
    name: 'Admin User',
    role: 'admin',
    avatar: '🔐',
    createdAt: new Date('2023-01-01'),
  },
};

// Mock courses
export const mockCourses: Record<string, Course> = {
  course1: {
    id: 'course1',
    title: 'Web Development Fundamentals',
    description: 'Learn HTML, CSS, and JavaScript basics to start your web dev journey',
    level: 'beginner',
    duration: 12,
    teacherId: 'teacher1',
    teacherName: 'Rajesh Kumar',
    thumbnail: '🌐',
    studentCount: 342,
    createdAt: new Date('2024-01-01'),
    modules: [
      {
        id: 'mod1',
        title: 'Introduction to Web',
        description: 'Understand the basics of the web',
        order: 1,
        lessons: [
          {
            id: 'les1-1',
            title: 'What is the Web?',
            description: 'Introduction to web technologies',
            duration: 15,
            order: 1,
          },
          {
            id: 'les1-2',
            title: 'How Browsers Work',
            description: 'Understanding browser mechanics',
            duration: 20,
            order: 2,
          },
          {
            id: 'les1-3',
            title: 'HTTP & HTTPS',
            description: 'Web protocols explained',
            duration: 18,
            order: 3,
          },
        ],
      },
      {
        id: 'mod2',
        title: 'HTML Basics',
        description: 'Master HTML structure',
        order: 2,
        lessons: [
          {
            id: 'les2-1',
            title: 'HTML Structure',
            description: 'Document structure and semantics',
            duration: 25,
            order: 1,
          },
          {
            id: 'les2-2',
            title: 'Forms & Input',
            description: 'Creating interactive forms',
            duration: 30,
            order: 2,
          },
        ],
      },
    ],
  },
  course2: {
    id: 'course2',
    title: 'React Mastery',
    description: 'Build interactive UIs with React and modern JavaScript',
    level: 'intermediate',
    duration: 20,
    teacherId: 'teacher1',
    teacherName: 'Rajesh Kumar',
    thumbnail: '⚛️',
    studentCount: 156,
    createdAt: new Date('2024-02-01'),
    modules: [
      {
        id: 'mod3',
        title: 'React Fundamentals',
        description: 'Core concepts of React',
        order: 1,
        lessons: [
          {
            id: 'les3-1',
            title: 'Components & Props',
            description: 'Building reusable components',
            duration: 35,
            order: 1,
          },
          {
            id: 'les3-2',
            title: 'State & Lifecycle',
            description: 'Managing component state',
            duration: 40,
            order: 2,
          },
        ],
      },
    ],
  },
  course3: {
    id: 'course3',
    title: 'Data Structures & Algorithms',
    description: 'Master DSA for competitive programming and interviews',
    level: 'intermediate',
    duration: 18,
    teacherId: 'teacher1',
    teacherName: 'Rajesh Kumar',
    thumbnail: '📊',
    studentCount: 289,
    createdAt: new Date('2024-01-20'),
    modules: [
      {
        id: 'mod4',
        title: 'Arrays & Strings',
        description: 'Fundamentals and algorithms',
        order: 1,
        lessons: [
          {
            id: 'les4-1',
            title: 'Array Operations',
            description: 'Basic and advanced array algorithms',
            duration: 45,
            order: 1,
          },
        ],
      },
    ],
  },
};

// Mock discussions
export const mockDiscussions: Record<string, DiscussionThread> = {
  disc1: {
    id: 'disc1',
    courseId: 'course1',
    authorId: 'student1',
    authorName: 'Priya Sharma',
    title: 'How to set up VS Code for Web Development?',
    content: 'I am new to web development and want to set up my environment properly. Can anyone guide me?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    views: 156,
    isResolved: true,
    replies: [
      {
        id: 'reply1',
        authorId: 'teacher1',
        authorName: 'Rajesh Kumar',
        authorRole: 'teacher',
        content: 'Great question! I recommend installing Node.js, VS Code, and these extensions: ESLint, Prettier, and Live Server.',
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        likes: 42,
        isUserLiked: true,
      },
      {
        id: 'reply2',
        authorId: 'student1',
        authorName: 'Priya Sharma',
        authorRole: 'student',
        content: 'Thanks! This helped me a lot. I got everything set up now.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 15,
      },
    ],
  },
  disc2: {
    id: 'disc2',
    courseId: 'course2',
    authorId: 'student1',
    authorName: 'Priya Sharma',
    title: 'Can I use React without Node.js?',
    content: 'I am learning React and wondering if I need Node.js. What is the difference?',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 89,
    isResolved: false,
    replies: [
      {
        id: 'reply3',
        authorId: 'teacher1',
        authorName: 'Rajesh Kumar',
        authorRole: 'teacher',
        content: 'You can use React in a browser directly with CDN, but Node.js is recommended for build tools like Webpack and Create React App.',
        createdAt: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000),
        likes: 28,
      },
    ],
  },
};

// Mock student analytics
export const mockStudentAnalytics: StudentAnalytics = {
  totalCoursesEnrolled: 3,
  coursesCompleted: 1,
  totalHoursLearned: 34,
  currentStreak: 7,
  weeklyData: [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 1.5 },
    { day: 'Wed', hours: 3 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 2 },
    { day: 'Sun', hours: 1 },
  ],
};

// Mock teacher analytics
export const mockTeacherAnalytics: TeacherAnalytics = {
  totalCourses: 3,
  totalStudents: 787,
  totalEnrollments: 900,
  weeklyEnrollments: [
    { day: 'Mon', hours: 12 },
    { day: 'Tue', hours: 8 },
    { day: 'Wed', hours: 15 },
    { day: 'Thu', hours: 10 },
    { day: 'Fri', hours: 18 },
    { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 3 },
  ],
};
