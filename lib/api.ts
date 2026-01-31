let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Initialize API URL from discovery server on app startup
export async function initializeAPI() {
  try {
    // For development: try localhost first
    let discoveryURL = "http://localhost:8001/ip";
    let backupIP = "localhost";
    
    let response = await fetch(discoveryURL, { method: "GET" }).catch(() => null);
    
    // If localhost fails, try emulator IP (Android emulator uses 10.0.2.2 to reach host)
    if (!response?.ok) {
      discoveryURL = "http://10.0.2.2:8001/ip";
      backupIP = "10.0.2.2";
      response = await fetch(discoveryURL, { method: "GET" }).catch(() => null);
    }
    
    // If emulator fails, try host machine IP
    if (!response?.ok) {
      discoveryURL = "http://192.168.1.54:8001/ip";
      backupIP = "192.168.1.54";
      response = await fetch(discoveryURL, { method: "GET" }).catch(() => null);
    }
    
    if (response?.ok) {
      const data = await response.json();
      API_URL = `http://${data.ip}:8000`;
      console.log("✅ Auto-discovered backend IP:", data.ip);
    } else {
      // Fallback: use backup IP
      API_URL = `http://${backupIP}:8000`;
      console.log("⚠️ Using fallback IP:", backupIP);
    }
  } catch (error) {
    console.log("⚠️ IP discovery error, using fallback");
    API_URL = "http://localhost:8000";
  }
}

export function getAPIURL() {
  return API_URL;
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
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
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

export async function createTeacherCourse(
  token: string,
  payload: {
    title: string;
    description?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    thumbnail?: string;
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
    throw new Error("Failed to delete user");
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
