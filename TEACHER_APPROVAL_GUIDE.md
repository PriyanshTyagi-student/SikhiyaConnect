# Teacher Approval System - Admin Guide

## Overview

Sikhiya Connect implements a comprehensive teacher approval system to ensure quality educators on the platform. All new teacher registrations require admin approval before they can access teacher features.

## System Architecture

### User Roles
- **Student**: Can enroll in courses, participate in discussions, and track progress
- **Teacher**: Can create courses and manage students (only after approval)
- **Admin**: Can approve/reject teacher applications and manage the platform

### Teacher Status States
- **pending**: Teacher just signed up, awaiting admin review
- **approved**: Teacher has been approved and can access full teacher features
- **rejected**: Teacher application was rejected

## Demo Credentials

Use these credentials to test the system:

### Student Account
- Email: `priya@sikhiya.com`
- Password: `password`
- Status: Approved student

### Pending Teachers (For Testing)
- Email: `aisha@sikhiya.com`
- Email: `vikram@sikhiya.com`
- Password: `password` (for both)
- Status: Pending approval

### Admin Account
- Email: `admin@sikhiya.com`
- Password: `password`
- Role: Admin (full access to approval dashboard)

## Features

### Teacher Signup Flow
1. New user selects "Teacher" role during signup
2. Account created with `status: 'pending'`
3. User automatically redirected to `/teacher/pending` page
4. User sees informative page explaining the review process
5. Teacher cannot access any teacher features until approved

### Admin Dashboard (`/admin`)
**Access**: Only admin@sikhiya.com can access

**Features**:
- **Stats Overview**: Displays count of pending, approved, and rejected applications
- **Pending Applications List**: Shows all teachers awaiting review
  - Teacher information (name, email, qualifications, bio)
  - Application date
  - Approve/Reject buttons
- **Approved Teachers List**: Shows successfully approved teachers
- **Rejected Applications List**: Shows rejected applications (for reference)

**Actions**:
- Click "Approve" button → Teacher status changes to 'approved'
- Click "Reject" button → Teacher status changes to 'rejected'
- Changes reflected instantly with toast notifications
- Status badges automatically update

### Pending Teacher Page (`/teacher/pending`)
**Access**: Only pending teachers can access

**Content**:
- Current application status
- 4-step review process explanation:
  1. Application Submitted
  2. Verification & Review
  3. Approval Decision
  4. Start Teaching
- FAQ section addressing:
  - Review timeline (2-3 business days)
  - Approval criteria
  - Rejection process
  - Status checking
- Check Status button for manual refresh

### Route Protection

#### Teacher Dashboard (`/teacher`)
- Requires: User role = 'teacher' AND status = 'approved'
- Redirects if not met:
  - Status = 'pending' → `/teacher/pending`
  - Status = 'rejected' or wrong role → `/dashboard`

#### Admin Dashboard (`/admin`)
- Requires: User role = 'admin'
- Redirects if not authorized → `/auth/sign-in`

#### Other Teacher Routes
- `/teacher/courses` - Only for approved teachers
- `/teacher/students` - Only for approved teachers

## Real-Time Updates

### Approval Notifications
When an admin approves a teacher:
1. Teacher's status immediately changes to 'approved'
2. Toast notification displayed to teacher (if logged in)
3. Teacher automatically redirected to `/teacher` dashboard
4. Status badge in header updates instantly
5. Email notification would be sent (in production)

### UI Updates
- Admin dashboard shows instant feedback
- Approved/rejected lists update immediately
- Status badges color-change:
  - Pending: Amber/yellow
  - Approved: Green
  - Rejected: Red

## Implementation Details

### Modified Files
- `/lib/types.ts` - Added TeacherStatus type and approval fields
- `/lib/auth-context.tsx` - Added approval/rejection methods and state management
- `/lib/mock-data.ts` - Added sample pending teachers and admin user
- `/app/auth/sign-up/page.tsx` - Redirect logic for new teachers
- `/app/auth/sign-in/page.tsx` - Demo credentials display
- `/app/teacher/page.tsx` - Route protection for approved status
- `/components/dashboard-layout.tsx` - Status badge display
- `/app/layout.tsx` - Added approval listener

### New Components
- `/app/admin/page.tsx` - Admin approval dashboard (309 lines)
- `/app/teacher/pending/page.tsx` - Pending teacher info page (221 lines)
- `/components/protected-route.tsx` - Route protection utility
- `/components/teacher-approval-listener.tsx` - Approval notifications
- `/components/root-layout-client.tsx` - Layout wrapper for listeners

### New Pages
- `/admin` - Admin dashboard
- `/teacher/pending` - Pending approval page

## Testing the System

### Test Scenario 1: Sign Up as New Teacher
1. Go to sign-up page
2. Select "Teacher" role
3. Fill in details and create account
4. Redirected to `/teacher/pending`
5. See review process explanation

### Test Scenario 2: Admin Approves Teacher
1. Login as admin@sikhiya.com
2. Go to `/admin`
3. See pending teachers list
4. Click "Approve" on a pending teacher
5. Toast notification appears
6. Teacher moved to "Approved Teachers" list
7. If pending teacher is logged in:
   - Toast notification displayed to them
   - Auto-redirected to teacher dashboard

### Test Scenario 3: Admin Rejects Teacher
1. Login as admin@sikhiya.com
2. Go to `/admin`
3. Click "Reject" on pending teacher
4. Toast notification appears (destructive style)
5. Teacher moved to "Rejected Applications" list

### Test Scenario 4: Pending Teacher Access Control
1. Login as aisha@sikhiya.com (pending teacher)
2. Try to access `/teacher` dashboard
3. Automatically redirected to `/teacher/pending`
4. Cannot access teacher features until approved

## State Management

The system uses React Context for state management:

```typescript
interface AuthContextType {
  user: User | null;
  approveTeacher: (teacherId: string) => void;
  rejectTeacher: (teacherId: string) => void;
  getPendingTeachers: () => User[];
  updateUser: (user: User) => void;
  // ... other methods
}
```

### State Updates
- Mock data stored in `usersData` state
- Changes reflected immediately across app
- In production, this would call API endpoints

## Production Considerations

### API Endpoints Needed
- `POST /api/teachers/approve/:id` - Approve teacher
- `POST /api/teachers/reject/:id` - Reject teacher
- `GET /api/teachers/pending` - Get pending applications
- `POST /api/teachers/register` - Register new teacher

### Security
- Add proper authentication/authorization
- Validate admin role on backend
- Add email verification before approval
- Implement rate limiting on admin actions
- Add audit logs for all approvals/rejections

### Email Notifications
- Send email when teacher signs up
- Send notification when application reviewed
- Send personalized approval/rejection message
- Admin notification of new pending applications

### UI Enhancements
- Batch approval/rejection
- Search and filter teachers
- Edit teacher details
- Custom rejection reasons
- Application timeline/history

## Troubleshooting

### Teacher Can't Access Dashboard After Approval
- Check browser console for errors
- Verify `teacherStatus` is actually 'approved' in auth context
- Try page refresh
- Clear browser cache and re-login

### Admin Dashboard Shows No Teachers
- Verify logged in as admin@sikhiya.com
- Check mock data includes pending teachers
- Verify teacher status is 'pending' not 'approved'

### Status Badge Not Updating
- Ensure TeacherApprovalListener is mounted
- Check auth context state changes are working
- Try page refresh

## Next Steps

To integrate with a real backend:
1. Replace mock data with API calls
2. Implement proper database models for users and approval status
3. Add email notification service
4. Implement audit logging
5. Add advanced search/filtering to admin dashboard
6. Create teacher application form with additional fields
7. Add rejection reason field and explanations
