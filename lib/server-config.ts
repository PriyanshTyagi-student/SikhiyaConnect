// This handles auto-discovery of the backend IP address

export async function getBackendURL(): Promise<string> {
  try {
    // First, try to get IP from a companion discovery server on port 8001
    const response = await fetch("http://192.168.1.54:8001/ip", {
      timeout: 2000,
    });
    if (response.ok) {
      const data = await response.json();
      const ip = data.ip;
      console.log("Discovered IP from server:", ip);
      return `http://${ip}:8000`;
    }
  } catch (error) {
    console.log("IP discovery server not available, using fallback");
  }

  // Fallback to environment variable or hardcoded IP
  return process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.54:8000";
}
