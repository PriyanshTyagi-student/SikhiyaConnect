'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  const navItems = isStudent
    ? [
        { href: '/dashboard', label: '📊 Dashboard' },
        { href: '/courses', label: '📚 Courses' },
        { href: '/discussions', label: '💬 Discussions' },
        { href: '/profile', label: '👤 Profile' },
      ]
    : [
        { href: '/dashboard', label: '📊 Dashboard' },
        { href: '/teacher/courses', label: '📚 My Courses' },
        { href: '/teacher/students', label: '👥 Students' },
        { href: '/discussions', label: '💬 Q&A' },
        { href: '/profile', label: '👤 Profile' },
      ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            📚 Sikhiya
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
              <div className="flex items-center gap-2 justify-end">
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{user?.role}</p>
                {user?.role === 'teacher' && user?.teacherStatus && (
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    user.teacherStatus === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : user.teacherStatus === 'pending'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {user.teacherStatus.charAt(0).toUpperCase() + user.teacherStatus.slice(1)}
                  </span>
                )}
              </div>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {sidebarOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-slate-700 dark:text-slate-300"
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
