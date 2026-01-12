const BASE = 'http://localhost:8080/api'; // proxas i dev

export async function api(path, init = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 120)}`);
  }

  // 204 No Content (common for DELETE)
  if (res.status === 204) return null;

  // If there is no body, return null
  const text = await res.text();
  if (!text) return null;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON but got ${ct}. First 120 chars: ${text.slice(0, 120)}`);
  }

  return JSON.parse(text);
}

