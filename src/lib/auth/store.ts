"use client";

import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { DEMO_USERS } from "@/data/seed";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User) => void;
}

/**
 * Mock auth store for local development.
 * Replace with real Cognito integration via adapter pattern.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!found) {
      set({ isLoading: false });
      return {
        success: false,
        error: "No account found with that email. Try: admin@swachhiitr.in",
      };
    }

    set({ user: found, isAuthenticated: true, isLoading: false });
    
    // Persist to sessionStorage for page refreshes
    if (typeof window !== "undefined") {
      sessionStorage.setItem("swachhiitr_user", JSON.stringify(found));
    }

    return { success: true };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("swachhiitr_user");
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
}));

/**
 * Role-based access helper.
 */
export function hasAccess(userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Initialize auth from session storage (for page refreshes).
 */
export function initAuthFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("swachhiitr_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}
