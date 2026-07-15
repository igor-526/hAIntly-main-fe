import { apiRequest } from "@/api/main-be";
import type { User } from "@/types/auth";

export const authSessionApi = {
  refresh: () => apiRequest<void>("/api/auth/refresh", { method: "POST" }),
  verify: () => apiRequest<User>("/api/auth/verify"),
  logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
};
