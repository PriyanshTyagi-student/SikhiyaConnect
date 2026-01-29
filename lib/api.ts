const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.119.241.133:8000";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return res.json();
}

export async function getDashboard(token: string) {
  const res = await fetch(`${API_URL}/dashboard`, {
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
