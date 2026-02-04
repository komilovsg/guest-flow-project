/**
 * GuestFlow API client — base URL and fetch wrapper.
 * Use with TanStack Query when adding auth and data fetching.
 */
const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : process.env.NEXT_PUBLIC_API_URL ?? "http://backend:8000";

export const apiBase = API_BASE;
export const apiV1 = `${API_BASE}/api/v1`;

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[];
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  const { params, ...init } = options ?? {};
  const url = new URL(path.startsWith("http") ? path : `${apiV1}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ detail: res.statusText }));
    const message =
      typeof err.detail === "string" ? err.detail : err.detail?.[0]?.msg ?? res.statusText;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiFetchWithAuth<T>(
  path: string,
  accessToken: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
