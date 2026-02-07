-- Add missing user/profile fields
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN qualifications TEXT;
ALTER TABLE users ADD COLUMN created_at TEXT;
ALTER TABLE users ADD COLUMN updated_at TEXT;

-- Add course/module/lesson/resource updated_at fields
ALTER TABLE courses ADD COLUMN updated_at TEXT;
ALTER TABLE course_modules ADD COLUMN updated_at TEXT;
ALTER TABLE course_lessons ADD COLUMN updated_at TEXT;
ALTER TABLE course_resources ADD COLUMN updated_at TEXT;

-- Add enrollment tracking fields
ALTER TABLE student_enrollments ADD COLUMN requested_at TEXT;
ALTER TABLE student_enrollments ADD COLUMN approved_at TEXT;
ALTER TABLE student_enrollments ADD COLUMN last_accessed_at TEXT;
ALTER TABLE student_enrollments ADD COLUMN updated_at TEXT;

-- Add lesson progress completion timestamp
ALTER TABLE lesson_progress ADD COLUMN completed_at TEXT;

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
