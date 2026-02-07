import CoursePageClient from './CoursePageClient';
import { mockCourses } from '@/lib/mock-data';

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(mockCourses).map((id) => ({ id }));
}

export default function CoursePage() {
  return <CoursePageClient />;
}
