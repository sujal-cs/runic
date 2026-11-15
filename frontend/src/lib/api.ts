const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Thin fetch wrapper that keeps credentials (session cookie) attached and
// normalizes JSON responses and errors for the rest of the app.
export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }
  return data;
}
