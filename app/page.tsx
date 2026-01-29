'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Sikhiya Connect</div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Features</a>
            <a href="#community" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Community</a>
            <a href="#about" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">About</a>
          </nav>
          <div className="flex gap-2">
            <Link href="/auth/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          Learn from the <span className="text-blue-600 dark:text-blue-400">Best</span>, Teach with <span className="text-purple-600 dark:text-purple-400">Purpose</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          Connect with expert teachers and passionate learners. Master new skills, share knowledge, and grow together in our interactive learning community.
        </p>
        <div className="flex gap-4 justify-center animate-slide-in-up">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2 hover:shadow-lg transition-shadow">
              Start Learning <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="hover:shadow-lg transition-shadow bg-transparent">Explore Features</Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white animate-slide-in-down">Why Choose Sikhiya?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
            <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Structured Learning</h3>
            <p className="text-slate-600 dark:text-slate-400">Comprehensive courses organized into modules and lessons for efficient learning progression.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Users className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Live Community</h3>
            <p className="text-slate-600 dark:text-slate-400">Engage in discussions, ask questions, and get answers from teachers and fellow learners.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Zap className="w-12 h-12 text-amber-600 dark:text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Track Progress</h3>
            <p className="text-slate-600 dark:text-slate-400">Visualize your learning journey with detailed analytics and achievement milestones.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-12 text-center text-white hover:shadow-xl transition-shadow animate-slide-in-up">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of students and teachers on Sikhiya Connect.</p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="hover:shadow-lg hover:scale-105 transition-all">Create Your Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>© 2026 Sikhiya Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
