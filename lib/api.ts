const DEFAULT_API_URL = "https://sikhiya-backend-worker.sikhiyaconnect.workers.dev";
const API_OVERRIDE_KEY = "sikhiya_api_url_override";
let API_URL = DEFAULT_API_URL;
let initPromise: Promise<void> | null = null;

type FetchFn = typeof globalThis.fetch;

const baseFetch: FetchFn = (...args: Parameters<FetchFn>) => globalThis.fetch(...args);
const fetchNoCache: FetchFn = (input: Parameters<FetchFn>[0], init: Parameters<FetchFn>[1] = {}) =>
  baseFetch(input, { ...init, cache: "no-store" });
const fetch: FetchFn = fetchNoCache;

function normalizeApiUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function getStoredApiOverride(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(API_OVERRIDE_KEY);
  return stored ? normalizeApiUrl(stored) : null;
}

export function setAPIURLOverride(url: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeApiUrl(url);
  if (!normalized) return;
  localStorage.setItem(API_OVERRIDE_KEY, normalized);
  API_URL = normalized;
}

export function clearAPIURLOverride() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_OVERRIDE_KEY);
  API_URL = DEFAULT_API_URL;
}

// Initialize API URL from discovery server on app startup
export async function initializeAPI() {
  // Return existing promise if already initializing
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const override = getStoredApiOverride();
    if (override) {
      API_URL = override;
      console.log("✅ Using API override:", API_URL);
      return;
    }
    console.log("✅ Using default API URL:", DEFAULT_API_URL);
  })();

  return initPromise;
}

export function getAPIURL() {
  return getStoredApiOverride() ?? API_URL;
}

// Wait for API to be initialized
export async function waitForAPIInit() {
  if (initPromise) {
    await initPromise;
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const res = await fetch(`${getAPIURL()}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return res.json();
}

export async function getCurrentUser(token: string) {
  const res = await fetch(`${getAPIURL()}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch current user (${res.status})`);
  }

  return res.json();
}

export async function getDashboard(token: string) {
  try {
    const apiURL = getAPIURL();
    console.log("🔍 Attempting to fetch dashboard from:", apiURL);
    console.log("🔑 Using token:", token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    const res = await fetch(`${apiURL}/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("📡 Dashboard response status:", res.status);

    if (res.status === 401) {
      // Token expired or invalid - clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sikhiya_token');
        localStorage.removeItem('sikhiya_user');
        window.location.href = '/auth/sign-in';
      }
      throw new Error("Authentication expired. Please sign in again.");
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard data: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error("❌ Dashboard fetch error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${getAPIURL()}. Please ensure the backend is running.`);
    }
    throw error;
  }
}

export async function getAdminStudents(token: string) {
  const res = await fetch(`${getAPIURL()}/admin/students`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch students");
  }

  return res.json();
}

export async function getTeacherCourses(token: string) {
  const res = await fetch(`${getAPIURL()}/teacher/courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch teacher courses");
  }

  return res.json();
}

export async function getTeacherDashboard(token: string) {
  const res = await fetch(`${getAPIURL()}/teacher/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch teacher dashboard");
  }

  return res.json();
}

export async function createTeacherCourse(
  token: string,
  payload: {
    title: string;
    description?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    thumbnail?: string;
    target_class?: string;
    target_board?: string;
  }
) {
  const res = await fetch(`${getAPIURL()}/teacher/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create course");
  }

  return res.json();
}

export async function getAdminTeachers(token: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${getAPIURL()}/admin/teachers${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch teachers");
  }

  return res.json();
}

export async function approveTeacherAdmin(token: string, teacherId: string) {
  const res = await fetch(`${getAPIURL()}/admin/teachers/${teacherId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to approve teacher");
  }

  return res.json();
}

export async function rejectTeacherAdmin(token: string, teacherId: string) {
  const res = await fetch(`${getAPIURL()}/admin/teachers/${teacherId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to reject teacher");
  }

  return res.json();
}

export async function deleteAdminUser(token: string, userId: string) {
  const res = await fetch(`${getAPIURL()}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const message = err?.detail || `Failed to delete user (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

export async function resetAdminUserPassword(token: string, userId: string) {
  const res = await fetch(`${getAPIURL()}/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to reset password");
  }

  return res.json();
}

// ==================== STUDENT ENDPOINTS ====================

export async function getAvailableCourses(token: string) {
  try {
    const res = await fetch(`${getAPIURL()}/courses/available`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch available courses");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error fetching available courses:", error);
    throw error;
  }
}

export async function getStudentEnrollments(token: string) {
  try {
    const res = await fetch(`${getAPIURL()}/student/enrollments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch enrollments");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error);
    throw error;
  }
}

export async function enrollInCourse(token: string, courseId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/courses/${courseId}/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to enroll in course");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error enrolling in course:", error);
    throw error;
  }
}

export async function getCourseDetails(token: string, courseId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/courses/${courseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch course details");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error fetching course details:", error);
    throw error;
  }
}

export async function getCourseModules(token: string, courseId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/teacher/courses/${courseId}/modules`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch course modules");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error fetching modules:", error);
    throw error;
  }
}
export async function unenrollFromCourse(token: string, courseId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/courses/${courseId}/unenroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to unenroll from course");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error unenrolling from course:", error);
    throw error;
  }
}

export async function getEnrollmentRequests(token: string, courseId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/teacher/courses/${courseId}/enrollment-requests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch enrollment requests");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error fetching enrollment requests:", error);
    throw error;
  }
}

export async function approveEnrollment(token: string, courseId: number, enrollmentId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/courses/${courseId}/enrollment/${enrollmentId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to approve enrollment");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error approving enrollment:", error);
    throw error;
  }
}

export async function rejectEnrollment(token: string, courseId: number, enrollmentId: number) {
  try {
    const res = await fetch(`${getAPIURL()}/courses/${courseId}/enrollment/${enrollmentId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to reject enrollment");
    }

    return res.json();
  } catch (error) {
    console.error("❌ Error rejecting enrollment:", error);
    throw error;
  }
}