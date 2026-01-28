const API_URL = "http://localhost:8000";

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
