'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, User, BookOpen, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div>
            <Card className="p-8 border-slate-200 dark:border-slate-800 text-center">
              <div className="text-6xl mb-4">{user.avatar || '👤'}</div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
              <p className="text-slate-600 dark:text-slate-400 capitalize mb-6">{user.role}</p>
              <Button className="w-full mb-2">Edit Photo</Button>
              <Button variant="outline" className="w-full bg-transparent">Download Certificate</Button>
            </Card>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                <Card className="p-6 border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Account Information</h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={user.name} />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input type="email" defaultValue={user.email} />
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <Input
                        value={user.createdAt.toLocaleDateString()}
                        disabled
                      />
                    </div>

                    <Button>Save Changes</Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="p-6 border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h3>

                  <div className="space-y-4">
                    {[
                      { label: 'Course Announcements', description: 'Get notified about new course updates' },
                      { label: 'Discussion Replies', description: 'Notify when someone replies to your posts' },
                      { label: 'Assignment Reminders', description: 'Remind me about upcoming assignments' },
                      { label: 'Weekly Summary', description: 'Send weekly learning summary email' },
                    ].map((pref) => (
                      <div key={pref.label} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{pref.label}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{pref.description}</p>
                        </div>
                        <input type="checkbox" className="mt-1" defaultChecked />
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6">Save Preferences</Button>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="p-6 border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Change Password</h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>

                    <Button>Update Password</Button>
                  </div>
                </Card>

                <Card className="p-6 border-slate-200 dark:border-slate-800 border-red-200 dark:border-red-800/30">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
