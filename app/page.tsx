'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, Zap, ArrowRight } from 'lucide-react';
import { getAPIURL } from '@/lib/api';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [testStatus, setTestStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [testTips, setTestTips] = useState<string>('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const testConnection = async () => {
    setTestStatus('checking');
    setTestMessage('');
    setTestTips('');
    const apiURL = getAPIURL();
    try {
      const healthController = new AbortController();
      const healthTimeout = setTimeout(() => healthController.abort(), 4000);
      const healthRes = await fetch(`${apiURL}/health`, { method: 'GET', cache: 'no-store', signal: healthController.signal });
      clearTimeout(healthTimeout);

      if (!healthRes.ok) {
        setTestStatus('error');
        setTestMessage(`Proxy not reachable (HTTP ${healthRes.status})`);
        setTestTips('The worker URL is blocked on this network or not deployed. Try another network or redeploy the worker.');
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${apiURL}/`, { method: 'GET', cache: 'no-store', signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        setTestStatus('error');
        setTestMessage(`HTTP ${res.status} ${res.statusText}`);
        setTestTips(getTipsFromStatus(res.status, apiURL));
        return;
      }
      setTestStatus('ok');
      setTestMessage(`Connected to ${apiURL}`);
      setTestTips('');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTestStatus('error');
      setTestMessage(`Failed: ${message}`);
      setTestTips(getTipsFromError(error, apiURL));
    }
  };

  const getTipsFromStatus = (status: number, apiURL: string) => {
    if (status === 401 || status === 403) {
      return 'Auth error. Sign in again or clear app data.';
    }
    if (status === 404) {
      return `Endpoint not found. Check if ${apiURL} is the proxy that forwards to the backend.`;
    }
    if (status === 429) {
      return 'Rate limited. Wait a minute and try again.';
    }
    if (status >= 500) {
      return 'Server error. The backend is down or restarting.';
    }
    return 'Unexpected response. Verify backend health and proxy forwarding.';
  };

  const getTipsFromError = (error: unknown, apiURL: string) => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'No internet connection on this device.';
    }
    if (error && typeof error === 'object' && 'name' in error && (error as Error).name === 'AbortError') {
      return `Request timed out. ${apiURL} may be blocked or slow.`;
    }
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Failed to fetch')) {
      return 'Network/CORS/DNS block. If the URL opens in the phone browser but fails in-app, reinstall the APK and allow network access.';
    }
    if (message.toLowerCase().includes('ssl') || message.toLowerCase().includes('certificate')) {
      return 'SSL error. Ensure the URL uses HTTPS with a valid certificate.';
    }
    return 'Unknown network error. Try another network or reinstall the app.';
  };


  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 md:bg-white/60 md:backdrop-blur-xl dark:md:bg-slate-950/60 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 shadow-[0_10px_25px_rgba(139,92,246,0.4)]" />
            <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500">Sikhiya</div>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-foreground/70 hover:text-foreground">Features</a>
            <a href="#community" className="text-foreground/70 hover:text-foreground">Community</a>
            <a href="#about" className="text-foreground/70 hover:text-foreground">About</a>
          </nav>
          <div className="flex gap-1 sm:gap-2">
            <Link href="/auth/sign-in">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="text-xs sm:text-sm">Start</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 py-12 sm:py-20 items-center">
          <div className="space-y-6 md:animate-fade-in motion-reduce:animate-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 px-4 py-2 text-xs font-medium text-foreground/70 shadow-sm">
              ✨ New semester experiences
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Learn in a
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500"> smooth fantasy</span>
              {' '}space built for real progress.
            </h1>
            <p className="text-base sm:text-lg text-foreground/70">
              Sikhiya Connect brings students and teachers into a shared, calm space with live guidance, clear paths, and uplifting community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full">See How It Works</Button>
              </a>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { label: 'Live courses', value: '120+' },
                { label: 'Active mentors', value: '80+' },
                { label: 'Weekly sessions', value: '350+' },
              ].map((stat) => (
                <div key={stat.label} className="fantasy-surface rounded-2xl p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-[11px] text-foreground/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="fantasy-surface rounded-3xl p-6 sm:p-8 md:shadow-[0_30px_80px_rgba(99,102,241,0.2)] shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Today</p>
                  <h3 className="text-xl font-semibold text-foreground">Your next learning path</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/60 text-xs text-foreground/70">2 sessions</span>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Algebra Foundations', mentor: 'A. Sharma', time: '4:30 PM' },
                  { title: 'Physics Lab Live', mentor: 'R. Kaur', time: '6:00 PM' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/20 bg-white/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/60">Mentor: {item.mentor}</p>
                      </div>
                      <span className="text-xs text-foreground/70">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-foreground/60">
                <span>Auto-synced across devices</span>
                <span>Safe & secure</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="fantasy-surface rounded-2xl p-4">
                <p className="text-xs text-foreground/60">Streak</p>
                <p className="text-lg font-semibold text-foreground">12 days 🔥</p>
              </div>
              <div className="fantasy-surface rounded-2xl p-4">
                <p className="text-xs text-foreground/60">Focus score</p>
                <p className="text-lg font-semibold text-foreground">92%</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-sm text-foreground/60">Designed for calm progress</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">A fresh way to learn, teach, and grow</h2>
            </div>
            <Button variant="outline" size="sm">Explore the platform</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="w-8 h-8 text-violet-500" />,
                title: 'Guided learning paths',
                desc: 'Step-by-step journeys with check-ins, recaps, and confidence boosts.',
              },
              {
                icon: <Users className="w-8 h-8 text-fuchsia-500" />,
                title: 'Live community rooms',
                desc: 'Ask questions in real time and learn together with peers and mentors.',
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: 'Gentle progress tracking',
                desc: 'See your growth with soft milestones and steady weekly goals.',
              },
            ].map((feature) => (
              <div key={feature.title} className="fantasy-surface rounded-3xl p-6 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-white/60 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="community" className="py-12 sm:py-16 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm text-foreground/60">Community first</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">A safe space for curious minds</h2>
            <p className="text-base text-foreground/70">
              Join class circles, ask anything, and celebrate wins together. Every learner gets support, every teacher gets clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/sign-up">
                <Button size="sm">Join the community</Button>
              </Link>
              <Link href="/discussions">
                <Button size="sm" variant="outline">Visit discussions</Button>
              </Link>
            </div>
          </div>
          <div className="fantasy-surface rounded-3xl p-6 space-y-4">
            {[
              { title: 'How do I prepare for CBSE finals?', replies: '14 replies · 2 mentors online' },
              { title: 'Best strategies for physics diagrams?', replies: '8 replies · 1 mentor online' },
              { title: 'Daily 20-min study routine tips', replies: '23 replies · 5 mentors online' },
            ].map((thread) => (
              <div key={thread.title} className="rounded-2xl bg-white/60 border border-white/20 p-4">
                <p className="text-sm font-semibold text-foreground">{thread.title}</p>
                <p className="text-xs text-foreground/60">{thread.replies}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="py-12 sm:py-16">
          <div className="fantasy-surface rounded-3xl p-6 sm:p-10 grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why learners love Sikhiya</h2>
              <p className="text-foreground/70">
                Soft visuals, clear routines, and responsive teachers help students stay consistent while enjoying every session.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Retention lift', value: '+38%' },
                { label: 'Student joy', value: '4.9★' },
                { label: 'Mentor rating', value: '4.8★' },
                { label: 'Weekly goals hit', value: '78%' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/60 border border-white/20 p-4 text-center">
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="fantasy-surface rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Quick connection check</h3>
              <p className="text-sm text-foreground/70 mb-4">Make sure your device can reach the learning servers.</p>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={testConnection}
                  disabled={testStatus === 'checking'}
                >
                  {testStatus === 'checking' ? 'Checking connection…' : 'Test Connection'}
                </Button>
                <Link href="/settings/server">
                  <Button size="sm" variant="ghost">Server Settings</Button>
                </Link>
              </div>
              {testStatus !== 'idle' && (
                <p className={`mt-3 text-xs sm:text-sm ${testStatus === 'ok' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {testMessage}
                </p>
              )}
              {testTips && (
                <p className="text-[11px] sm:text-xs text-foreground/60 mt-2">
                  Tip: {testTips}
                </p>
              )}
            </div>
            <div className="rounded-3xl p-8 sm:p-10 text-white transition-shadow bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500 md:shadow-[0_25px_60px_rgba(99,102,241,0.35)] shadow-none">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start your journey?</h2>
              <p className="text-sm sm:text-base mb-6 opacity-90">Join thousands of learners and mentors on Sikhiya Connect.</p>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary" className="md:hover:shadow-lg md:hover:scale-105 transition-all motion-reduce:transition-none w-full sm:w-auto">Create Your Account</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/20 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-foreground/60">
          <p>© 2026 Sikhiya Connect. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#community" className="hover:text-foreground">Community</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
