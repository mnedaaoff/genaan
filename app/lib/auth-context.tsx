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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message ?? "Login failed");
    }
    const { user, token } = await res.json();
    persist(user, token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message ?? "Registration failed");
    }
    const { user, token } = await res.json();
    persist(user, token);
  }, []);

  const logout = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    const token = stored ? JSON.parse(stored)?.token : null;
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false });
    // Fire-and-forget backend logout
    if (API_BASE && token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {/* ignore */});
    }
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
