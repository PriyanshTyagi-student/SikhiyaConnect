import { DashboardLayout } from '@/components/dashboard-layout';
import { mockCourses } from '@/lib/mock-data';
import CourseClient from './CourseClient';

export function generateStaticParams() {
  return Object.keys(mockCourses).map((id) => ({ id }));
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = mockCourses[params.id as keyof typeof mockCourses];

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">Course not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return <CourseClient course={course} />;
}
