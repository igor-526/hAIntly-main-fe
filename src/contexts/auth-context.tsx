"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ApiError } from "@/api/main-be";
import { authSessionApi } from "@/api/auth-session";
import type { User } from "@/types/auth";

type AuthState = { status: "checking" | "authenticated" | "anonymous" | "error"; user?: User; error?: string; logoutPending: boolean; logoutError?: string };
type AuthContextValue = AuthState & { check: () => Promise<boolean>; logout: () => Promise<boolean> };
const AuthContext = createContext<AuthContextValue | null>(null);
let refreshPromise: Promise<unknown> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "checking", logoutPending: false });
  const logoutInFlight = useRef(false);
  const check = useCallback(async () => {
    setState({ status: "checking", logoutPending: false });
    try {
      let user: User | undefined;
      try { user = await authSessionApi.verify(); }
      catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        refreshPromise ??= authSessionApi.refresh().finally(() => { refreshPromise = null; });
        try { await refreshPromise; } catch (refreshError) {
          if (refreshError instanceof ApiError && refreshError.status === 401) { setState({ status: "anonymous", logoutPending: false }); return false; }
          throw refreshError;
        }
        user = await authSessionApi.verify();
      }
      if (user) { setState({ status: "authenticated", user, logoutPending: false }); return true; }
      setState({ status: "anonymous", logoutPending: false }); return false;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { setState({ status: "anonymous", logoutPending: false }); return false; }
      setState({ status: "error", error: error instanceof Error ? error.message : "Ошибка проверки сессии", logoutPending: false }); return false;
    }
  }, []);
  const logout = useCallback(async () => {
    if (logoutInFlight.current) return false;
    logoutInFlight.current = true; setState(value => ({ ...value, logoutPending: true, logoutError: undefined }));
    try { await authSessionApi.logout(); setState({ status: "anonymous", logoutPending: false }); return true; }
    catch (error) { setState(value => ({ ...value, logoutPending: false, logoutError: error instanceof Error ? error.message : "Не удалось выйти" })); return false; }
    finally { logoutInFlight.current = false; }
  }, []);
  useEffect(() => { queueMicrotask(() => void check()); }, [check]);
  return <AuthContext.Provider value={{ ...state, check, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth требует AuthProvider"); return value; }
