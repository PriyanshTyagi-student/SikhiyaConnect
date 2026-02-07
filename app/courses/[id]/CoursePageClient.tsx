'use client';

import CourseClient from './CourseClient';
import { useParams } from 'next/navigation';

export default function CoursePageClient() {
  const params = useParams();
  const courseId = params?.id as string;

  return <CourseClient courseId={courseId} />;
}
