"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

// ─── Shape ────────────────────────────────────────────────────────────────────

interface AppUser {
  id: number | string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout:   () => void;
  isAdmin:  boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toAppUser(su: SupabaseUser, session: Session): AppUser {
  const meta = su.user_metadata ?? {};
  return {
    id:         su.id,
    name:       meta.full_name ?? meta.name ?? su.email ?? "User",
    email:      su.email ?? "",
    is_admin:   meta.is_admin === true || meta.role === "admin",
    created_at: su.created_at,
    updated_at: su.updated_at ?? su.created_at,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null, isLoading: true,
  });

  // Rehydrate session from Supabase on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState({
          user:      toAppUser(session.user, session),
          token:     session.access_token,
          isLoading: false,
        });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    });

    // Listen for sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setState({
          user:      toAppUser(session.user, session),
          token:     session.access_token,
          isLoading: false,
        });
      } else {
        setState({ user: null, token: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
  ) => {
    const fullName = `${firstName} ${lastName}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, first_name: firstName, last_name: lastName, phone } },
    });
    if (error) throw new Error(error.message);

    // Upsert profile row so checkout & other pages can read name/phone immediately
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone ?? null,
      }, { onConflict: "id" });
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
