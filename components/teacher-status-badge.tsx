'use client';

import { TeacherStatus } from '@/lib/types';
import { Check, Clock, X } from 'lucide-react';

interface TeacherStatusBadgeProps {
  status: TeacherStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function TeacherStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: TeacherStatusBadgeProps) {
  const styles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variants = {
    approved: {
      container: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100',
      icon: <Check className={`w-${size === 'sm' ? 3 : size === 'md' ? 4 : 5} h-${size === 'sm' ? 3 : size === 'md' ? 4 : 5}`} />,
      label: 'Approved',
    },
    pending: {
      container: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100',
      icon: <Clock className={`w-${size === 'sm' ? 3 : size === 'md' ? 4 : 5} h-${size === 'sm' ? 3 : size === 'md' ? 4 : 5}`} />,
      label: 'Pending',
    },
    rejected: {
      container: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100',
      icon: <X className={`w-${size === 'sm' ? 3 : size === 'md' ? 4 : 5} h-${size === 'sm' ? 3 : size === 'md' ? 4 : 5}`} />,
      label: 'Rejected',
    },
  };

  const variant = variants[status];

  return (
    <div className={`inline-flex items-center gap-1.5 font-medium rounded-full ${styles[size]} ${variant.container}`}>
      {showIcon && variant.icon}
      {variant.label}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * <TeacherStatusBadge status="approved" />
 * <TeacherStatusBadge status="pending" size="lg" />
 * <TeacherStatusBadge status="rejected" size="sm" showIcon={false} />
 */
