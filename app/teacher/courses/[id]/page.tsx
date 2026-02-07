import CourseDetailClient from './CourseDetailClient';
import { mockCourses } from '@/lib/mock-data';

export async function generateStaticParams() {
  return Object.keys(mockCourses).map((id) => ({ id }));
}

export const dynamicParams = false;

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
