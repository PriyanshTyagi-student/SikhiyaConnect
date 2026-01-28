# Teacher Approval System - System Architecture

## Component Hierarchy

```
RootLayout
├── AuthProvider (Context)
│   ├── RootLayoutClient
│   │   ├── TeacherApprovalListener
│   │   └── {children}
│   │       ├── Navbar/Header
│   │       └── Page Content
│   └── Toaster
└── Analytics
```

## State Management Flow

```
AuthContext (Global State)
├── user: User | null
├── usersData: Record<string, User>
├── isLoading: boolean
│
├── Methods:
│   ├── login(email, password)
│   ├── logout()
│   ├── signup(email, password, name, role)
│   ├── approveTeacher(teacherId)
│   ├── rejectTeacher(teacherId)
│   ├── getPendingTeachers()
│   └── updateUser(user)
│
└── Triggers:
    ├── User state changes
    ├── TeacherApprovalListener subscribes
    ├── Notifications sent
    └── UI updates
```

## Data Flow: Teacher Approval

```
Admin clicks "Approve" button
         ↓
approveTeacher(teacherId) called
         ↓
usersData updated with:
├── user[id].teacherStatus = 'approved'
└── if (user.id === teacherId) setUser(updated)
         ↓
React re-render
├── Admin dashboard UI updates
├── Approved list refreshed
└── Status badges re-render
         ↓
Toast notification shown
└── "Teacher Approved"
         ↓
TeacherApprovalListener checks
├── previousStatus: 'pending'
├── currentStatus: 'approved'
└── Match found!
         ↓
Teacher notification toast shown
└── "Congratulations! You've been approved"
         ↓
Auto-redirect to /teacher
└── Router.push('/teacher')
```

## File Organization

```
Sikhiya Connect/
├── app/
│   ├── layout.tsx (Root layout with AuthProvider)
│   ├── page.tsx (Landing page)
│   ├── globals.css (Animations & styling)
│   │
│   ├── auth/
│   │   ├── sign-in/
│   │   │   └── page.tsx (Demo credentials)
│   │   └── sign-up/
│   │       └── page.tsx (Role selection → pending status)
│   │
│   ├── dashboard/ (Student dashboard)
│   ├── courses/ (Course browsing)
│   ├── discussions/ (Community forum)
│   ├── profile/ (User profile)
│   ├── analytics/ (Analytics)
│   │
│   ├── teacher/
│   │   ├── page.tsx (Teacher dashboard - protected)
│   │   ├── pending/ (NEW)
│   │   │   └── page.tsx (Pending approval info)
│   │   ├── courses/
│   │   └── students/
│   │
│   └── admin/ (NEW)
│       └── page.tsx (Admin approval dashboard)
│
├── lib/
│   ├── types.ts (Updated with TeacherStatus)
│   ├── auth-context.tsx (Updated with approval methods)
│   └── mock-data.ts (Updated with pending teachers)
│
├── components/
│   ├── dashboard-layout.tsx (Status badge added)
│   ├── protected-route.tsx (NEW)
│   ├── teacher-approval-listener.tsx (NEW)
│   ├── root-layout-client.tsx (NEW)
│   ├── teacher-status-badge.tsx (NEW)
│   ├── theme-toggle.tsx
│   └── ui/ (shadcn components)
│
├── hooks/
│   └── use-toast.ts (Toast notifications)
│
├── proxy.js (Updated from middleware.ts)
│
└── Documentation/
    ├── TEACHER_APPROVAL_GUIDE.md (Comprehensive guide)
    ├── TEACHER_APPROVAL_OVERVIEW.md (Quick reference)
    ├── IMPLEMENTATION_SUMMARY.md (What was built)
    └── SYSTEM_ARCHITECTURE.md (This file)
```

## Authentication & Authorization Flow

```
User Visits App
       ↓
Check useAuth() hook
├── No user → Show public pages
├── User exists → Check role & status
│
├── role === 'student' → Access: /dashboard, /courses, etc.
├── role === 'teacher'
│   ├── status === 'pending' → Access: /teacher/pending only
│   ├── status === 'approved' → Access: /teacher, /teacher/courses, etc.
│   └── status === 'rejected' → Access: Home only
└── role === 'admin' → Access: /admin, /admin/*
```

## User Status State Machine

```
                      ┌─────────────────┐
                      │   No Status     │
                      │  (Students)     │
                      └─────────────────┘

┌──────────────────────────────────────────────┐
│         TEACHER SIGNUP INITIATED             │
└──────────────────────────────────────────────┘
                      ↓
            ┌─────────────────┐
            │    PENDING      │
            │  (Awaiting      │
            │  Admin Review)  │
            └────┬─────────┬──┘
           /      │        \
         /        │          \
    APPROVED  [WAITING]   REJECTED
      ↓                      ↓
   ✓ Full              ✗ Cannot
   Teacher            access
   Access            teacher
                     features
```

## Route Protection Implementation

### Method 1: Client-Side useEffect Hook
```typescript
useEffect(() => {
  if (!user) router.push('/auth/sign-in');
  if (user.role !== 'teacher') router.push('/dashboard');
  if (user.teacherStatus !== 'approved') router.push('/teacher/pending');
}, [user, router]);
```

### Method 2: ProtectedRoute Wrapper Component
```typescript
<ProtectedRoute requiredRole="teacher" requiredTeacherStatus="approved">
  <TeacherDashboard />
</ProtectedRoute>
```

### Method 3: Server-Side Middleware (Proxy)
```typescript
// /proxy.js - Allows Next.js 16 compatibility
// Can add server-side validation here
```

## Database Schema (Future Production)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role ENUM('student', 'teacher', 'admin'),
  avatar VARCHAR,
  created_at TIMESTAMP,
  
  -- Teacher-specific fields
  teacher_status ENUM('pending', 'approved', 'rejected'),
  bio TEXT,
  qualifications TEXT,
  
  CONSTRAINT valid_teacher_status CHECK (
    role = 'teacher' OR teacher_status IS NULL
  )
);

CREATE TABLE teacher_approvals (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES users(id),
  admin_id UUID REFERENCES users(id),
  status ENUM('pending', 'approved', 'rejected'),
  rejection_reason TEXT,
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  
  CONSTRAINT valid_admin CHECK (admin_role = 'admin')
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  action VARCHAR,
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMP
);
```

## API Endpoints (Future Production)

```
POST /api/auth/signup
├── Input: { email, password, name, role }
├── Logic: 
│   ├── Hash password with bcrypt
│   ├── Create user record
│   ├── If role='teacher', set status='pending'
│   └── Send welcome email
└── Output: { user, token }

POST /api/auth/login
├── Input: { email, password }
├── Logic: Authenticate user
└── Output: { user, token }

GET /api/admin/teachers/pending
├── Auth: Require admin role
├── Logic: Query all pending teachers
└── Output: { teachers[] }

POST /api/admin/teachers/:id/approve
├── Auth: Require admin role
├── Input: { rejection_reason? }
├── Logic:
│   ├── Update user.teacher_status = 'approved'
│   ├── Log to audit_logs
│   ├── Send approval email
│   └── Notify teacher via WebSocket
└── Output: { success, teacher }

POST /api/admin/teachers/:id/reject
├── Auth: Require admin role
├── Input: { rejection_reason }
├── Logic:
│   ├── Update user.teacher_status = 'rejected'
│   ├── Log to audit_logs
│   ├── Send rejection email with reason
│   └── Notify teacher via WebSocket
└── Output: { success, teacher }

GET /api/admin/stats
├── Auth: Require admin role
├── Logic: Count pending, approved, rejected
└── Output: { pending: int, approved: int, rejected: int }
```

## Real-Time Updates Strategy

### Current (Mock)
- Direct state updates via React context
- Instant UI refresh
- Toast notifications

### Future Production Options
1. **WebSocket + Socket.io**
   ```javascript
   socket.on('teacher:approved', (teacher) => {
     updateUser(teacher);
     showToast('Approved!');
   });
   ```

2. **Server-Sent Events (SSE)**
   ```javascript
   const eventSource = new EventSource('/api/notifications');
   eventSource.onmessage = (e) => updateUser(JSON.parse(e.data));
   ```

3. **Polling (Simple)**
   ```javascript
   setInterval(() => {
     checkUserStatus();
   }, 5000); // Check every 5 seconds
   ```

## Performance Considerations

### Current Implementation
- State updates: O(1) lookup by user ID
- Pending teachers list: O(n) filter where n = total users
- Rendering: Only affected components re-render

### Optimizations (Future)
- Memoize teacher lists with useMemo
- Lazy load admin dashboard
- Paginate pending teachers list (show 10 per page)
- Implement virtual scrolling for large lists
- Cache admin stats with React Query

## Error Handling Strategy

```
Try Operation
  ↓
[Success]
  ├── Update state
  ├── Show toast
  └── Redirect if needed

[Error]
  ├── Log error
  ├── Show error toast
  └── Suggest action
      ├── Retry
      ├── Contact support
      └── Go back
```

## Security Layers

### Frontend
1. ✓ Route protection via useAuth
2. ✓ Role checking in components
3. ✓ Status validation before access

### Backend (Needed)
1. JWT token validation
2. Role verification on each request
3. Audit logging of all admin actions
4. Rate limiting on approval endpoints
5. CSRF protection
6. Input validation/sanitization

### Database
1. Row-level security policies
2. Encrypted sensitive data
3. Backup/disaster recovery
4. Transaction management

## Testing Strategy

### Unit Tests (to add)
```typescript
// Auth context tests
- approveTeacher() updates status
- rejectTeacher() updates status
- getPendingTeachers() filters correctly

// Component tests
- ProtectedRoute redirects unauthorized users
- TeacherStatusBadge shows correct color
- Admin dashboard loads pending list

// Route tests
- /admin requires admin role
- /teacher requires approved status
```

### Integration Tests (to add)
```typescript
// Full flow tests
- Teacher signs up → Redirected to pending
- Admin approves → Teacher can access dashboard
- Real-time notification delivery
```

### E2E Tests (to add)
```typescript
// User journey tests
- Complete signup flow
- Complete approval flow
- Notification delivery verification
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Email service configured
- [ ] WebSocket server setup (if using)
- [ ] Redis cache configured (optional)
- [ ] Logging/monitoring configured
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Load testing completed

## Monitoring & Observability

### Metrics to Track
- Approval time (average, median, p95)
- Approval rate (approved vs rejected %)
- Admin action frequency
- Page load times
- Error rates per endpoint

### Logs to Capture
- All admin approvals/rejections
- Failed attempts to access protected routes
- Authentication failures
- API errors

### Alerts to Set
- Admin dashboard access failures
- Unusual approval activity
- Database errors
- High error rates

---

**This system is scalable and production-ready with these architectural improvements.**
