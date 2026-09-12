import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

/**
 * -----------------------------------------------------------------------------
 * Authentication & Session Management Store
 * -----------------------------------------------------------------------------
 * SECURITY & ARCHITECTURAL NOTE ON TOKEN STORAGE:
 * In this implementation, bearer JWT tokens are stored in memory and synchronized
 * with a persisted client-side layer (`localStorage` via zustand/persist).
 * 
 * Trade-offs:
 * 1. `localStorage`: Convenient for Single Page Applications (SPAs) and decouples
 *    frontend and backend domains. However, it is accessible to JavaScript running
 *    in the page context (vulnerable if an XSS exploit occurs).
 * 2. `httpOnly` Cookies (Preferred for pure SSR/BFF architectures): When the backend
 *    issues an `httpOnly`, `Secure`, `SameSite=Strict/Lax` cookie, JavaScript cannot
 *    read or leak the token.
 * 
 * If/when the production Spring Boot backend configures cookie-based session
 * authorization with CORS credentials enabled (`credentials: 'include'`), the
 * bearer token string can be removed from client storage, keeping only the user
 * profile in this store.
 * -----------------------------------------------------------------------------
 */

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User, refreshToken?: string | null) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user, refreshToken = null) =>
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          user,
          isAuthenticated: true,
        })),
      setTokens: (token, refreshToken = null) =>
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
        })),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'dakpion:auth',
    },
  ),
);
