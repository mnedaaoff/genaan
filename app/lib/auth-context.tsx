"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout:   () => void;
  isAdmin:  boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "genaan_token";

// ─── Mock admin user for demo ─────────────────────────────────────────────────
const MOCK_ADMIN: User = {
  id: 1, name: "Admin User", email: "admin@genaan.com",
  is_admin: true, created_at: "2025-01-01T00:00:00Z", updated_at: "2026-04-16T00:00:00Z",
};
const MOCK_USER: User = {
  id: 12, name: "Jane Doe", email: "jane@genaan.com",
  is_admin: false, created_at: "2025-06-01T00:00:00Z", updated_at: "2026-04-16T00:00:00Z",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null, isLoading: true,
  });

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ user: parsed.user, token: parsed.token, isLoading: false });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const persist = (user: User, token: string) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ user, token }));
    setState({ user, token, isLoading: false });
  };

  const login = useCallback(async (email: string, password: string) => {
    if (!API_BASE) {
      // Mock login
      const mockUser = email === "admin@genaan.com" ? MOCK_ADMIN : MOCK_USER;
      if (password.length < 6) throw new Error("Invalid credentials");
      persist(mockUser, "mock_token_" + Date.now());
      return;
    }
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Login failed");
    }
    const { user, token } = await res.json();
    persist(user, token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!API_BASE) {
      persist({ ...MOCK_USER, name, email }, "mock_token_" + Date.now());
      return;
    }
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Registration failed");
    }
    const { user, token } = await res.json();
    persist(user, token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login, register, logout,
      isAdmin: state.user?.is_admin ?? false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
