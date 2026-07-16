import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HhOAuthCallback } from "./oauth-callback";
const callback = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("code=hidden&state=hidden-state"),
}));
vi.mock("./service", () => ({
  hhAccountService: { callback: (...args: unknown[]) => callback(...args) },
}));
describe("HhOAuthCallback", () => {
  beforeEach(() => {
    callback.mockReset();
    vi.useRealTimers();
  });
  it("доступен без auth provider, сообщает success только opener и закрывается", async () => {
    const postMessage = vi.fn();
    const close = vi.spyOn(window, "close").mockImplementation(() => {});
    Object.defineProperty(window, "opener", {
      configurable: true,
      value: { postMessage },
    });
    callback.mockResolvedValue({ success: true });
    render(<HhOAuthCallback />);
    await waitFor(() => expect(screen.getByText(/Аккаунт HH подключён/)).toBeInTheDocument());
    expect(postMessage).toHaveBeenCalledWith({ type: "haintly:hh-oauth-success" }, window.location.origin);
    expect(postMessage.mock.calls[0][0]).toEqual({
      type: "haintly:hh-oauth-success",
    });
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(document.body).not.toHaveTextContent("hidden");
  });
  it("без opener не отправляет сообщение и не пытается закрыть обычную вкладку", async () => {
    const close = vi.spyOn(window, "close").mockImplementation(() => {});
    Object.defineProperty(window, "opener", {
      configurable: true,
      value: null,
    });
    callback.mockResolvedValue({ success: true });
    render(<HhOAuthCallback />);
    await waitFor(() => expect(screen.getByText(/Аккаунт HH подключён/)).toBeInTheDocument());
    expect(close).not.toHaveBeenCalled();
  });
  it("показывает безопасную ошибку без query values", async () => {
    callback.mockResolvedValue({
      success: false,
      message: "Callback отклонён",
    });
    render(<HhOAuthCallback />);
    expect(await screen.findByText("Callback отклонён")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть окно" })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("hidden");
  });
});
