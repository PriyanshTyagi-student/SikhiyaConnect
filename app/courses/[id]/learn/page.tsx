import LessonPageClient from './LessonPageClient';
import { mockCourses } from '@/lib/mock-data';

export async function generateStaticParams() {
  return Object.keys(mockCourses).map((id) => ({ id }));
}

export const dynamicParams = false;

export default function LessonPage() {
  return <LessonPageClient />;
}
