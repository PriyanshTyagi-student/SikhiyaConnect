# Teacher Approval System - Quick Start Guide

## 🎯 Get Started in 5 Minutes

### Step 1: Understand the System (1 min)
The teacher approval system restricts teacher access until approved by an admin.

**Flow:**
```
Teacher Signs Up → Pending Status → Admin Approves → Full Access
```

### Step 2: Login with Demo Accounts (1 min)

Go to **Sign In** page: `/auth/sign-in`

Choose one of these accounts:

#### 👨‍🎓 Test as Student
```
Email: priya@sikhiya.com
Password: password
```
Can access: Dashboard, Courses, Discussions, Profile

#### 👨‍🏫 Test as Pending Teacher
```
Email: aisha@sikhiya.com
OR
Email: vikram@sikhiya.com
Password: password
```
Can access: ONLY /teacher/pending (Approval info page)

#### 🔐 Test as Admin
```
Email: admin@sikhiya.com
Password: password
```
Can access: Admin Dashboard at `/admin`

### Step 3: Test Teacher Signup (1 min)

1. Go to `/auth/sign-up`
2. Fill in the form:
   - Name: Your Test Name
   - Email: test@example.com
   - Password: password123
   - Select: **👨‍🏫 Teacher**
3. Click "Create Account"
4. You'll be redirected to `/teacher/pending`
5. See the approval review process explanation

### Step 4: Approve as Admin (1 min)

1. Login as `admin@sikhiya.com`
2. Go to `/admin` (Admin Dashboard)
3. See stats: Pending=X, Approved=Y, Rejected=Z
4. Find pending teachers in the list
5. Click the green **"Approve"** button
6. See:
   - ✓ Toast: "Teacher Approved"
   - ✓ Teacher moved to "Approved Teachers" section
   - ✓ Status badge updates
7. If teacher is logged in:
   - ✓ They see approval toast
   - ✓ Auto-redirected to `/teacher` dashboard

### Step 5: Test Access (1 min)

**Before Approval:**
```
Pending teacher tries: /teacher
Result: Redirected to /teacher/pending
```

**After Approval:**
```
Teacher tries: /teacher
Result: ✓ Loads teacher dashboard
```

## 🎮 Common Test Scenarios

### Scenario 1: Complete Teacher Lifecycle
```
1. Sign up as new teacher
2. Get redirected to /teacher/pending
3. Try to access /teacher → Blocked (redirect)
4. Admin logs in → /admin
5. Admin approves the new teacher
6. Teacher (if logged in) sees notification
7. Teacher can now access /teacher
```

### Scenario 2: Rejection Flow
```
1. Admin at /admin dashboard
2. Click "Reject" on pending teacher
3. See rejection toast
4. Teacher moves to rejected section
5. Rejected teacher cannot access teacher features
```

### Scenario 3: Admin Access Control
```
1. Login as non-admin teacher
2. Try to access /admin
3. Get redirected to /auth/sign-in
4. Cannot access approval dashboard
```

### Scenario 4: Route Protection
```
1. Teacher (not logged in) tries /teacher
2. Redirected to /auth/sign-in
3. Login as pending teacher
4. Still get redirected to /teacher/pending
5. Cannot access /teacher/courses or other teacher routes
```

## 🎨 What You'll See

### Admin Dashboard (`/admin`)

**Stats Cards (Top):**
```
📋 Pending Applications: 2
✅ Approved Teachers: 1
❌ Rejected Applications: 0
```

**Pending Teachers Section:**
```
👩‍🏫 Aisha Khan
   aisha@sikhiya.com
   Qualifications: M.S. Data Science, 5 years experience
   Bio: Data Science enthusiast and AI specialist
   Applied on: 1/10/2024
   
   [✓ Approve] [✗ Reject]
```

**Approved Teachers Section (After Approval):**
```
👩‍🏫 Aisha Khan
   aisha@sikhiya.com
   [Approved Badge]
```

### Teacher Pending Page (`/teacher/pending`)

**Status Section:**
```
⏳ Application Under Review
   Your teacher account is pending approval
   
   Current Status: Pending Approval
   Applied on: 1/27/2026
```

**4-Step Process:**
```
1️⃣ Application Submitted → Your application has been submitted
2️⃣ Verification & Review → Admin will verify qualifications
3️⃣ Approval Decision → You'll get email notification
4️⃣ Start Teaching → Access teacher dashboard
```

**FAQ:**
- How long does the review take? (2-3 business days)
- What are the approval criteria? (Relevant expertise, etc.)
- What if my application is rejected? (Can reapply)
- Can I check my application status? (See current status here)

## 📱 Status Badge in Header

When logged in, your status appears in the header:

**Student:**
```
Priya Sharma
Student
```

**Pending Teacher:**
```
Aisha Khan
Teacher 🟡 Pending
```

**Approved Teacher:**
```
Rajesh Kumar
Teacher 🟢 Approved
```

**Rejected Teacher:**
```
John Doe
Teacher 🔴 Rejected
```

## 🔔 Toast Notifications

### Admin Approves Teacher
```
✓ Teacher Approved
  Aisha Khan has been approved as a teacher.
```

### Admin Rejects Teacher
```
✗ Teacher Rejected
  Vikram Patel's application has been rejected.
```

### Teacher Gets Approved (Real-time)
```
🎉 Congratulations!
   Your teacher account has been approved. You can now access
   the teacher dashboard.
   [Auto-redirects to /teacher in 2 seconds]
```

### Teacher Gets Rejected (Real-time)
```
✗ Application Rejected
  Your teacher application has been rejected. Please contact
  support for more information.
```

## 🚀 Keyboard Shortcuts (None Implemented Yet)
- Could add: `Cmd+K` to open admin dashboard (future)

## 📚 Documentation Files

```
/QUICK_START.md                 ← You are here
/TEACHER_APPROVAL_GUIDE.md      ← Comprehensive guide
/TEACHER_APPROVAL_OVERVIEW.md   ← Quick reference
/IMPLEMENTATION_SUMMARY.md      ← What was built
/SYSTEM_ARCHITECTURE.md         ← Technical deep-dive
```

## 🆘 Troubleshooting

### "Can't access /admin"
**Solution:** Login as `admin@sikhiya.com`

### "Teacher can access /teacher when pending"
**Solution:** Refresh page, check status in auth context

### "No pending teachers showing"
**Solution:** Sign up with "Teacher" role, or use demo accounts (aisha/vikram)

### "Notifications not appearing"
**Solution:** Check browser notification permissions, ensure app is in focus

### "Status badge not updating"
**Solution:** Refresh page or logout/login

## ✅ Testing Checklist

- [ ] Can login with all demo accounts
- [ ] Pending teacher redirected to /teacher/pending
- [ ] Admin can see pending teachers at /admin
- [ ] Admin can approve teacher
- [ ] Admin can reject teacher
- [ ] Teacher status updates instantly
- [ ] Toast notifications appear
- [ ] Status badge updates in header
- [ ] Pending teacher cannot access /teacher
- [ ] Approved teacher CAN access /teacher
- [ ] Non-admin cannot access /admin

## 🎯 What's Working

✅ Teacher signup with pending status
✅ Admin approval system
✅ Real-time UI updates
✅ Route protection
✅ Toast notifications
✅ Status badges
✅ Pending info page
✅ Role-based access control
✅ Mock data system
✅ Demo accounts
✅ Dark mode support
✅ Responsive design

## 🔮 What's Next (Production)

Before deploying to production, add:
- [ ] Real database (Supabase, PostgreSQL, etc.)
- [ ] Email notifications
- [ ] Proper authentication (JWT, sessions)
- [ ] Backend API endpoints
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Error handling
- [ ] Security validation
- [ ] Unit/E2E tests

## 💡 Pro Tips

1. **Test Real-Time:** Open two browser windows
   - Left: Admin at /admin
   - Right: Teacher at /teacher/pending
   - Approve in left window
   - Watch right window update instantly

2. **Test Redirects:** When logged in as pending teacher
   - Try typing `/teacher` in address bar
   - You'll be redirected to `/teacher/pending`

3. **Check Network:** In DevTools, you can see
   - No API calls (mock system)
   - State updates in console
   - Component re-renders

4. **Create New Teacher:** Instead of using demo accounts
   - Go to /auth/sign-up
   - Select teacher role
   - Complete the flow
   - Becomes available for admin to approve

## 📞 Support

For issues or questions:
1. Check TEACHER_APPROVAL_GUIDE.md for detailed info
2. Check SYSTEM_ARCHITECTURE.md for technical details
3. Check error console for JavaScript errors
4. Review the code comments in implementation files

## 🎓 Learning Resources

This implementation demonstrates:
- Next.js App Router
- React Context for state management
- TypeScript type safety
- Route protection patterns
- UI/UX best practices
- Toast notifications
- Status management
- Dark mode implementation
- Responsive design

## 🏆 You're All Set!

You now understand the teacher approval system and can:
- ✅ Test as different user types
- ✅ Use the admin dashboard
- ✅ Approve/reject teachers
- ✅ See real-time updates
- ✅ Understand the flow

**Start with:** `/auth/sign-in` → Login → Explore!

---

**For more details, read the comprehensive guides in the documentation files.**
