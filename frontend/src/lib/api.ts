const BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:4000");

// Thin fetch wrapper that keeps credentials (session cookie) attached and
// normalizes JSON responses and errors for the rest of the app.
export async function api(path: string, options: RequestInit = {}) {
  const url = `${BASE}${path}`;
  const method = options.method || "GET";

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    // fetch rejects on DNS failures, refused connections, and CORS blocks.
    // Surface the URL so the terminal/console makes the cause obvious.
    console.error(`[api] ${method} ${url} could not reach the server`, err);
    throw new Error(`Cannot reach the API at ${BASE}. Is the backend running?`);
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.error) ||
      res.statusText ||
      `Request failed with status ${res.status}`;

    // The session check is expected to 401 for logged-out visitors.
    const expected = res.status === 401 && path === "/api/auth/me";
    if (!expected) {
      console.error(`[api] ${method} ${url} -> ${res.status}: ${message}`, data ?? "");
    }
    throw new Error(message);
  }

  return data;
}
