'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import CourseClient from './CourseClient';
import { useParams } from 'next/navigation';

export default function CoursePage() {
  const params = useParams();
  const courseId = params?.id as string;

  return <CourseClient courseId={courseId} />;
}
