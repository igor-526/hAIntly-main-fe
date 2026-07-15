import { apiRequest } from "@/api/main-be";
import type { LoginData, RegisterData, User } from "@/types/auth";
export const authService = {
  register: (data: RegisterData) => apiRequest<User>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: LoginData) => apiRequest<void>("/api/auth/token", { method: "POST", body: JSON.stringify(data) }),
  refresh: () => apiRequest<void>("/api/auth/refresh", { method: "POST" }),
  verify: () => apiRequest<User>("/api/auth/verify"),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
};
