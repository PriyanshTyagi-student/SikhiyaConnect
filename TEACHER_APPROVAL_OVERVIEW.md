# Teacher Approval System - Quick Reference

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW TEACHER SIGNUP                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Sign up with "Teacher" role                              │
│  2. Account created with status: 'pending'                   │
│  3. Auto-redirected to /teacher/pending                      │
│                                                               │
│  Status: PENDING                                             │
│  Access: View pending page only                              │
│  Cannot: Access teacher features                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN REVIEW PROCESS                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Admin: admin@sikhiya.com                                    │
│  Access: /admin dashboard                                    │
│                                                               │
│  Actions:                                                     │
│  ┌──────────────┐          ┌──────────────┐                 │
│  │   APPROVE    │          │    REJECT    │                 │
│  │   Button     │          │    Button    │                 │
│  └──────┬───────┘          └──────┬───────┘                 │
│         │                         │                          │
└─────────┼─────────────────────────┼──────────────────────────┘
          ↓                         ↓
    ┌──────────────┐          ┌──────────────┐
    │  APPROVED    │          │   REJECTED   │
    │              │          │              │
    │ Status:      │          │ Status:      │
    │ approved     │          │ rejected     │
    │              │          │              │
    │ Access:      │          │ Access:      │
    │ ✓ Dashboard  │          │ ✗ Blocked    │
    │ ✓ Courses    │          │ (Redirect    │
    │ ✓ Students   │          │  to home)    │
    │ ✓ Q&A        │          │              │
    └──────────────┘          └──────────────┘
```

## Route Protection Map

```
PUBLIC ROUTES
└── /                (Landing page)
└── /auth/sign-in    (Sign in)
└── /auth/sign-up    (Sign up)

STUDENT ROUTES (requires role: 'student')
└── /dashboard       (Student dashboard)
└── /courses         (Browse courses)
└── /discussions     (Discussions)
└── /profile         (User profile)
└── /analytics       (Analytics)

TEACHER ROUTES (requires role: 'teacher' AND status: 'approved')
├── /teacher         (Teacher dashboard)
├── /teacher/courses (Manage courses)
└── /teacher/students (Manage students)

PENDING TEACHER ROUTE (requires status: 'pending')
└── /teacher/pending (Approval info page)

ADMIN ROUTES (requires role: 'admin')
└── /admin           (Admin dashboard)
   └── Pending approvals
   └── Approve/Reject buttons
   └── Approved teachers list
   └── Rejected applications list
```

## Demo Accounts Cheat Sheet

| Email | Password | Role | Status | Access |
|-------|----------|------|--------|--------|
| priya@sikhiya.com | password | student | N/A | Dashboard, Courses |
| rajesh@sikhiya.com | password | teacher | approved | Teacher Dashboard |
| aisha@sikhiya.com | password | teacher | pending | Pending Page Only |
| vikram@sikhiya.com | password | teacher | pending | Pending Page Only |
| admin@sikhiya.com | password | admin | N/A | Admin Dashboard |

## Key Features at a Glance

### For Teachers
- ✅ Sign up with pending status
- ✅ View application review process
- ✅ Real-time approval notifications
- ✅ Auto-redirect on approval
- ✅ Status badge in header

### For Admin
- ✅ Dashboard with stats (pending, approved, rejected counts)
- ✅ List of pending applications with full details
- ✅ One-click approve/reject buttons
- ✅ View approved and rejected teachers
- ✅ Instant UI updates with toast notifications
- ✅ Teacher qualifications and bio display

### For Students
- ✅ No changes to student flow
- ✅ Can still access all courses
- ✅ Discussions work normally

## Status Badge Colors

```
┌────────┬─────────────────────────────────┐
│ Status │ Color & Display                 │
├────────┼─────────────────────────────────┤
│pending │ 🟡 Amber - waiting for review   │
│approve │ 🟢 Green - approved & active    │
│reject  │ 🔴 Red - application rejected   │
└────────┴─────────────────────────────────┘
```

## Notification Examples

### Teacher Approval Toast
```
✓ Congratulations!
Your teacher account has been approved. You can now access
the teacher dashboard.
[Auto-redirect to /teacher in 2 seconds]
```

### Teacher Rejection Toast
```
✗ Application Rejected
Your teacher application has been rejected. Please contact
support for more information.
```

### Admin Approval Toast
```
✓ Teacher Approved
Aisha Khan has been approved as a teacher.
```

### Admin Rejection Toast
```
✗ Teacher Rejected
Vikram Patel's application has been rejected.
```

## Component Structure

```
AuthContext (State Management)
├── approveTeacher() → Updates user status
├── rejectTeacher() → Updates user status
├── getPendingTeachers() → Returns pending list
├── updateUser() → Syncs user data
└── TeacherApprovalListener (Notifications)

Protected Routes
├── ProtectedRoute component
├── Route-level checks in useEffect
└── Client-side redirects

Pages
├── /admin → Admin approval dashboard
├── /teacher/pending → Pending info page
├── /teacher → Teacher dashboard (protected)
└── Route protection in each page

UI Components
├── Status badges (dashboard header)
├── Toast notifications
├── Approval cards (admin list)
└── Status indicators
```

## Quick Approval Workflow

1. **New teacher signs up** → Status: pending
2. **Redirected to** → /teacher/pending page
3. **Admin login** → /admin dashboard
4. **Admin sees** → List of pending teachers
5. **Admin clicks** → "Approve" button
6. **System updates**:
   - ✓ Teacher status → 'approved'
   - ✓ Toast notification → Admin
   - ✓ Toast notification → Teacher (if logged in)
   - ✓ Teacher auto-redirects → /teacher
   - ✓ Status badge updates → Header

## Testing Checklist

- [ ] Sign up as new teacher → Redirects to /teacher/pending
- [ ] Access /teacher before approval → Redirects back to pending
- [ ] Login as admin → Can access /admin
- [ ] Admin approves teacher → Toast appears
- [ ] Approved teacher → Can access /teacher
- [ ] Reject teacher → Moves to rejected list
- [ ] Status badges → Show correct colors
- [ ] Pending page → Loads info correctly
- [ ] Admin stats → Show correct numbers

## API Integration Points (Future)

For production deployment, these endpoints are needed:

```
POST /api/auth/signup
  → Check if teacher, set status: pending

GET /api/admin/teachers/pending
  → Return list of pending teachers

POST /api/admin/teachers/:id/approve
  → Update status to 'approved'
  → Send email notification
  → Update admin logs

POST /api/admin/teachers/:id/reject
  → Update status to 'rejected'
  → Send rejection email
  → Update admin logs

GET /api/admin/stats
  → Return counts: pending, approved, rejected
```

---

**For detailed documentation, see TEACHER_APPROVAL_GUIDE.md**
