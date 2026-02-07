-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  reset_otp TEXT,
  otp_expiry TEXT,
  board TEXT,
  student_class TEXT,
  teacher_status TEXT,
  avatar TEXT,
  bio TEXT,
  qualifications TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT DEFAULT 'beginner',
  duration_hours INTEGER DEFAULT 0,
  thumbnail TEXT,
  teacher_id INTEGER NOT NULL,
  target_class TEXT,
  target_board TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Course Modules
CREATE TABLE IF NOT EXISTS course_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  `order` INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_file TEXT,
  duration_seconds INTEGER DEFAULT 0,
  `order` INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (module_id) REFERENCES course_modules(id)
);

-- Resources
CREATE TABLE IF NOT EXISTS course_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size_mb REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Student Enrollments
CREATE TABLE IF NOT EXISTS student_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT DEFAULT 'active',
  requested_at TEXT,
  approved_at TEXT,
  last_accessed_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  last_accessed TEXT,
  completed_at TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id)
);

-- Discussion Threads
CREATE TABLE IF NOT EXISTS discussion_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  views INTEGER DEFAULT 0,
  is_resolved INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (thread_id) REFERENCES discussion_threads(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Reply Likes
CREATE TABLE IF NOT EXISTS discussion_reply_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reply_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (reply_id, user_id),
  FOREIGN KEY (reply_id) REFERENCES discussion_replies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Learning Sessions (Analytics)
CREATE TABLE IF NOT EXISTS learning_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER,
  lesson_id INTEGER,
  duration_minutes INTEGER DEFAULT 0,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id)
);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  course_announcements INTEGER DEFAULT 1,
  discussion_replies INTEGER DEFAULT 1,
  assignment_reminders INTEGER DEFAULT 1,
  weekly_summary INTEGER DEFAULT 1,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
