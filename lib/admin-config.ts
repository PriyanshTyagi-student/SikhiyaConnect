/**
 * Admin Configuration File
 * 
 * This file stores admin credentials for local development.
 * IMPORTANT: This file should be in .gitignore to prevent credentials from being committed.
 * 
 * To set your own admin credentials:
 * 1. Change the email and password below
 * 2. The backend will validate these during login
 * 3. Once logged in, you'll have full admin access
 */

// Admin credentials - Change these to your desired values
export const ADMIN_CONFIG = {
  email: 'sikhiyaconnect@gmail.com',
  password: 'admin@sikhiya007', // Change this to your secure password
  name: 'Sikhiya Admin',
  role: 'admin' as const,
};


/**
 * SECURITY NOTES:
 * - This file is for LOCAL DEVELOPMENT ONLY
 * - In production, use environment variables and proper authentication systems
 * - Never commit real passwords to version control
 * - Use a .env.local file instead in production
 * - Consider implementing role-based access control (RBAC) with proper permissions
 */
