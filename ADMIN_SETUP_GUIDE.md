# Admin Configuration Guide

## Setting Up Admin Credentials

You can now manage admin access through the `lib/admin-config.ts` file. This allows you to create your own admin account with custom credentials.

### How to Use

1. **Edit the Admin Config File**
   - Open `lib/admin-config.ts`
   - Modify the `ADMIN_CONFIG` object with your desired email and password:
   
   ```typescript
   export const ADMIN_CONFIG = {
     email: 'your-email@example.com',
     password: 'your-secure-password',
     name: 'Your Admin Name',
     role: 'admin' as const,
   };
   ```

2. **Login to Admin Panel**
   - Go to the login page
   - Enter the email and password you set in `admin-config.ts`
   - You'll be redirected to the Admin Dashboard

3. **Access Admin Features**
   Once logged in, you can:
   - **View all students** - See student IDs, emails, board, class, and passwords
   - **Manage teachers** - Approve or reject teacher applications
   - **View statistics** - See platform metrics at a glance
   - **Search functionality** - Find students and teachers quickly

### Admin Dashboard Features

#### 📊 Dashboard Tabs

1. **Pending** - Review and approve/reject new teacher applications
2. **Teachers** - View all approved teachers in your system
3. **Students** - See all student accounts with their details
4. **Settings** - Admin profile and platform settings

#### 👥 Student Management
- View all enrolled students
- See student board and class information
- Toggle password visibility (eye icon)
- Search students by name or email

#### ✅ Teacher Approval
- Review pending teacher applications
- View teacher qualifications and bio
- Approve or reject applications with one click
- See statistics on pending, approved, and rejected teachers

### Security Notes

⚠️ **Important**: This admin system is designed for **local development only**.

For production deployment, implement:
- Two-factor authentication (2FA)
- Password hashing with bcrypt
- Audit logging for all admin actions
- Role-based access control (RBAC)
- Encrypted storage of sensitive data
- IP whitelisting
- Admin activity logs

### Example Admin Credentials

Default development credentials (if not modified):
```
Email: admin@sikhiya.com
Password: admin123
```

### File Location

- Configuration: `lib/admin-config.ts`
- Admin Page: `app/admin/page.tsx`
- Auth Context: `lib/auth-context.tsx`

### Troubleshooting

**Cannot login as admin?**
- Ensure the email and password in `admin-config.ts` match exactly
- Clear browser cookies and try again
- Check the browser console for any errors

**Cannot see student passwords?**
- Click the eye icon next to the password field to toggle visibility
- Passwords are only displayed while viewing students in the admin panel
- This information is not persisted or logged

**Changes not reflecting?**
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache if needed
- Restart the development server

## Configuration File Location

```
SikhiyaConnect/
└── lib/
    └── admin-config.ts  ← Edit this file
```

## Next Steps

After setting up your admin account:
1. Test logging in with your credentials
2. Navigate through each admin tab
3. Test approving/rejecting teachers
4. Verify student data is displaying correctly
5. Check search functionality

For more information, see `IMPLEMENTATION_SUMMARY.md` for overall architecture details.
