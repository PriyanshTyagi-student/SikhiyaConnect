'use client';

import { useParams } from 'next/navigation';
import LessonClient from './LessonClient';

export default function LessonPageClient() {
  const params = useParams();
  const courseId = params?.id as string;

  return <LessonClient courseId={courseId} />;
}
