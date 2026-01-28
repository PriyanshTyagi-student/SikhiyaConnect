'use client';

import React from "react"

import { TeacherApprovalListener } from './teacher-approval-listener';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TeacherApprovalListener />
      {children}
    </>
  );
}
