"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { authService } from "./service";
import type { User } from "./types";

type AuthState = { status: "checking" | "authenticated" | "anonymous" | "error"; user?: User; error?: string };
type AuthContextValue = AuthState & { check: () => Promise<boolean> };
const AuthContext = createContext<AuthContextValue | null>(null);
let refreshPromise: Promise<unknown> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "checking" });
  const check = useCallback(async () => {
    setState({ status: "checking" });
    try {
      let user: User | undefined;
      try { user = await authService.verify(); }
      catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        refreshPromise ??= authService.refresh().finally(() => { refreshPromise = null; });
        try { await refreshPromise; } catch (refreshError) {
          if (refreshError instanceof ApiError && refreshError.status === 401) { setState({ status: "anonymous" }); return false; }
          throw refreshError;
        }
        user = await authService.verify();
      }
      if (user) { setState({ status: "authenticated", user }); return true; }
      setState({ status: "anonymous" }); return false;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) { setState({ status: "anonymous" }); return false; }
      setState({ status: "error", error: error instanceof Error ? error.message : "Ошибка проверки сессии" }); return false;
    }
  }, []);
  useEffect(() => { queueMicrotask(() => void check()); }, [check]);
  return <AuthContext.Provider value={{ ...state, check }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth требует AuthProvider"); return value; }
