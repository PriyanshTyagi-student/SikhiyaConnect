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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.1)]">
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4 gap-2 md:gap-4">
          <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 flex-shrink-0">
            📚
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground text-sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-foreground truncate">{user?.name?.split(' ')[0]}</p>
              <div className="flex items-center gap-2 justify-end">
                <p className="text-xs text-foreground/70 capitalize">{user?.role}</p>
                {user?.role === 'teacher' && user?.teacherStatus && (
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    user.teacherStatus === 'approved'
                      ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : user.teacherStatus === 'pending'
                      ? 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                  }`}>
                    {user.teacherStatus.charAt(0).toUpperCase() + user.teacherStatus.slice(1)}
                  </span>
                )}
              </div>
            </div>
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-xs md:text-sm px-2 md:px-3">
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1 text-foreground/80"
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
          <div className="md:hidden border-t border-white/15 p-4 flex flex-col gap-2 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-foreground/80 hover:text-foreground"
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
