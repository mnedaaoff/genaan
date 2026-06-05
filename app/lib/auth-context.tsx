"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { resolveIsAdmin } from "./admin-status";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

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

function toAppUser(su: SupabaseUser, is_admin: boolean): AppUser {
  const meta = su.user_metadata ?? {};
  return {
    id:         su.id,
    name:       meta.full_name ?? meta.name ?? su.email ?? "User",
    email:      su.email ?? "",
    is_admin,
    created_at: su.created_at,
    updated_at: su.updated_at ?? su.created_at,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null, isLoading: true,
  });

  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      setState({ user: null, token: null, isLoading: false });
      return;
    }
    const is_admin = await resolveIsAdmin(session.user);
    setState({
      user:      toAppUser(session.user, is_admin),
      token:     session.access_token,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

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
