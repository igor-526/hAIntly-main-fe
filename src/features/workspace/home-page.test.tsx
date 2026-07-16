import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./home-page";

type Status = "checking" | "authenticated" | "anonymous" | "error";
const replace = vi.fn();
const auth: {
  status: Status;
  check: ReturnType<typeof vi.fn>;
  error?: string;
} = { status: "checking", check: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/contexts/auth-context", () => ({ useAuth: () => auth }));
vi.mock("./hh-accounts/workspace", () => ({
  HhWorkspace: () => <div>Рабочая область HH</div>,
}));

describe("home route gate", () => {
  beforeEach(() => {
    replace.mockReset();
    auth.check.mockReset();
    auth.status = "checking";
    delete auth.error;
  });
  it("скрывает home при checking", () => {
    render(<HomePage />);
    expect(screen.queryByText("Рабочая область HH")).not.toBeInTheDocument();
  });
  it("перенаправляет гостя", async () => {
    auth.status = "anonymous";
    render(<HomePage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
  it("показывает home пользователю", () => {
    auth.status = "authenticated";
    render(<HomePage />);
    expect(screen.getByText("Рабочая область HH")).toBeInTheDocument();
  });
  it("вызывает retry из protected error", async () => {
    auth.status = "error";
    auth.error = "Сеть";
    render(<HomePage />);
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(auth.check).toHaveBeenCalledOnce();
  });
});
