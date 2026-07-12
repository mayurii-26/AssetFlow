"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "asset_manager" | "department_head" | "employee";
  organization: string;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, organization: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "assetflow_token";
const USER_KEY  = "assetflow_user";
const API_BASE  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage (rememberMe) or sessionStorage (session-only) on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
      const storedUser  = localStorage.getItem(USER_KEY)  ?? sessionStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  const persist = (t: string, u: AuthUser, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, t);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } else {
      // Session only — cleared when browser tab closes
      sessionStorage.setItem(TOKEN_KEY, t);
      sessionStorage.setItem(USER_KEY, JSON.stringify(u));
    }
    setCookie(TOKEN_KEY, t, rememberMe ? 7 : 0); // session cookie when rememberMe=false
    setToken(t);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data.error || "Invalid credentials" };
      persist(data.token, data.user, rememberMe);
      return { success: true };
    } catch {
      return { success: false, error: "Cannot reach server. Is the backend running?" };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, organization: string) => {
    try {
      const res  = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, organization }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return { success: false, error: data.error || "Signup failed" };
      // Do NOT persist or auto-login — user must log in explicitly
      return { success: true, message: data.message as string };
    } catch {
      return { success: false, error: "Cannot reach server. Is the backend running?" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    deleteCookie(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
