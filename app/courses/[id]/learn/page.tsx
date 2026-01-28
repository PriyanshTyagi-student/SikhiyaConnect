import { mockCourses } from '@/lib/mock-data';
import LessonClient from './LessonClient';

export function generateStaticParams() {
  return Object.keys(mockCourses).map((id) => ({ id }));
}

export default function LessonPage({ params }: { params: { id: string } }) {
  const course = mockCourses[params.id as keyof typeof mockCourses];

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Course not found</p>
      </div>
    );
  }

  return <LessonClient course={course} />;
}
