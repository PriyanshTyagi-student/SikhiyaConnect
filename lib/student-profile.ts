'use client';

export type StudentProfile = {
  email: string;
  board: string;
  classLevel: string;
  createdAt: string;
};

const PROFILE_KEY = "sikhiya_student_profile";

export function getStudentProfile(email?: string): StudentProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const profile = JSON.parse(raw) as StudentProfile;
    if (email && profile.email !== email) return null;
    return profile;
  } catch {
    return null;
  }
}

export function setStudentProfile(profile: StudentProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearStudentProfile() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
}
