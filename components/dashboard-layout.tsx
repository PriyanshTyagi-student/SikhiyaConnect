'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
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
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-4">
          <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
            📚
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 text-sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name?.split(' ')[0]}</p>
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
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent text-xs md:text-sm px-2 md:px-3">
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
