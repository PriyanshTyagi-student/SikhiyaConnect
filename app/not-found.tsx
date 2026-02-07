import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">The page you’re looking for doesn’t exist.</p>
        <div className="mt-6">
          <Link href="/" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
