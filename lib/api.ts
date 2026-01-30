let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.54:8000";

// Initialize API URL from discovery server on app startup
export async function initializeAPI() {
  try {
    // Try emulator first (Android emulator uses 10.0.2.2 to reach host)
    let discoveryURL = "http://10.0.2.2:8001/ip";
    let backupIP = "10.0.2.2";
    
    let response = await fetch(discoveryURL, { method: "GET" }).catch(() => null);
    
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
    API_URL = "http://192.168.1.54:8000";
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
  const res = await fetch(`${getAPIURL()}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}
