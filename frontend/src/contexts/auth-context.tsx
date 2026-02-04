"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiV1, apiFetch, apiFetchWithAuth } from "@/lib/api-client";
import type { User } from "@/types/auth";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

function getStoredRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setStoredTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchMe = useCallback(async (token: string) => {
    const data = await apiFetchWithAuth<Record<string, unknown>>("/auth/me", token);
    const user: User = {
      id: String(data?.id ?? ""),
      email: String(data?.email ?? ""),
      role: (data?.role as User["role"]) ?? "manager",
      restaurant_id: data?.restaurant_id != null ? String(data.restaurant_id) : null,
      is_active: Boolean(data?.is_active),
    };
    setUser(user);
    return user;
  }, []);

  const refreshAccess = useCallback(async (): Promise<string | null> => {
    const refresh = getStoredRefresh();
    if (!refresh) return null;
    try {
      const res = await fetch(`${apiV1}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.access_token) return null;
      setStoredTokens(data.access_token, data.refresh_token ?? refresh);
      setAccessToken(data.access_token);
      return data.access_token;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAccess();
    if (!token) {
      setAccessToken(null);
      setUser(null);
      setIsInitialized(true);
      return;
    }
    setAccessToken(token);
    fetchMe(token)
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (cancelled) return;
        refreshAccess().then((newToken) => {
          if (cancelled) return;
          if (newToken) fetchMe(newToken).catch(() => setUser(null));
          else {
            clearStoredTokens();
            setAccessToken(null);
            setUser(null);
          }
        });
      })
      .finally(() => {
        if (!cancelled) setIsInitialized(true);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchMe, refreshAccess]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<{ access_token: string; refresh_token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      setStoredTokens(data.access_token, data.refresh_token);
      setAccessToken(data.access_token);
      await fetchMe(data.access_token);
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
    clearStoredTokens();
    setAccessToken(null);
    setUser(null);
  }, []);

  const setTokens = useCallback(
    (access: string, refresh: string) => {
      setStoredTokens(access, refresh);
      setAccessToken(access);
      fetchMe(access).catch(() => setUser(null));
    },
    [fetchMe]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isInitialized,
      login,
      logout,
      setTokens,
    }),
    [user, accessToken, isInitialized, login, logout, setTokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
