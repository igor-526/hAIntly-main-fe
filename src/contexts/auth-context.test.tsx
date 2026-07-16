import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/main-be";
import { AuthProvider, useAuth } from "./auth-context";
import { authSessionApi } from "@/api/auth-session";
import type { User } from "@/types/auth";
vi.mock("@/api/auth-session", () => ({
  authSessionApi: { verify: vi.fn(), refresh: vi.fn(), logout: vi.fn() },
}));
const user: User = { id: "u1", email: "t@example.test", roles: [] };
const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
describe("AuthProvider", () => {
  beforeEach(() => {
    vi.mocked(authSessionApi.verify).mockReset();
    vi.mocked(authSessionApi.refresh).mockReset();
    vi.mocked(authSessionApi.logout).mockReset();
  });
  it("аутентифицирует по действующей сессии без refresh", async () => {
    vi.mocked(authSessionApi.verify).mockResolvedValue(user);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(authSessionApi.refresh).not.toHaveBeenCalled();
  });
  it("выполняет один refresh и повторный verify", async () => {
    vi.mocked(authSessionApi.verify).mockRejectedValueOnce(new ApiError("expired", 401)).mockResolvedValueOnce(user);
    vi.mocked(authSessionApi.refresh).mockResolvedValue(void 0);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(authSessionApi.refresh).toHaveBeenCalledOnce();
    expect(authSessionApi.verify).toHaveBeenCalledTimes(2);
  });
  it("делает invalid refresh anonymous без цикла", async () => {
    vi.mocked(authSessionApi.verify).mockRejectedValue(new ApiError("expired", 401));
    vi.mocked(authSessionApi.refresh).mockRejectedValue(new ApiError("invalid", 401));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("anonymous"));
    expect(authSessionApi.verify).toHaveBeenCalledOnce();
    expect(authSessionApi.refresh).toHaveBeenCalledOnce();
  });
  it("объединяет параллельный refresh", async () => {
    vi.mocked(authSessionApi.verify).mockResolvedValueOnce(user);
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.mocked(authSessionApi.refresh).mockReturnValue(pending);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    vi.mocked(authSessionApi.verify).mockRejectedValueOnce(new ApiError("expired", 401)).mockRejectedValueOnce(new ApiError("expired", 401)).mockResolvedValue(user);
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    act(() => {
      first = result.current.check();
      second = result.current.check();
    });
    await waitFor(() => expect(authSessionApi.refresh).toHaveBeenCalledOnce());
    release();
    await act(async () => {
      await Promise.all([first, second]);
    });
    expect(authSessionApi.refresh).toHaveBeenCalledOnce();
  });
  it("позволяет безопасный retry после network error", async () => {
    vi.mocked(authSessionApi.verify).mockRejectedValueOnce(new ApiError("Сеть")).mockResolvedValueOnce(user);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("error"));
    await act(async () => {
      expect(await result.current.check()).toBe(true);
    });
    expect(result.current.status).toBe("authenticated");
  });
  it("делает anonymous только после успешного logout", async () => {
    vi.mocked(authSessionApi.verify).mockResolvedValue(user);
    vi.mocked(authSessionApi.logout).mockResolvedValue(void 0);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    await act(async () => {
      expect(await result.current.logout()).toBe(true);
    });
    expect(result.current.status).toBe("anonymous");
  });
  it("сохраняет пользователя и позволяет retry при ошибке logout", async () => {
    vi.mocked(authSessionApi.verify).mockResolvedValue(user);
    vi.mocked(authSessionApi.logout).mockRejectedValueOnce(new Error("Сеть"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    await act(async () => {
      expect(await result.current.logout()).toBe(false);
    });
    expect(result.current.status).toBe("authenticated");
    expect(result.current.user).toEqual(user);
    expect(result.current.logoutError).toBe("Сеть");
  });
});
