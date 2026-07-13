import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HhWorkspace } from "./workspace";

const hook = vi.fn();
vi.mock("./use-hh-accounts", () => ({ useHhAccounts: () => hook() }));
const anna = { id: "1", hh_user_id: "7", display_name: "Анна", email: null, avatar_url: null, created_at: "", updated_at: null };
const boris = { id: "2", hh_user_id: "8", display_name: "Борис", email: null, avatar_url: null, created_at: "", updated_at: null };
const base = { loading: false, pending: false, error: undefined, accounts: [], activeId: null, load: vi.fn(), connect: vi.fn(), select: vi.fn(), remove: vi.fn() };
const multiple = { ...base, accounts: [anna, boris], activeId: "1" };

describe("HhWorkspace", () => {
  beforeEach(() => {
    Object.values(base).filter((value) => typeof value === "function").forEach((value) => value.mockReset());
    base.connect.mockResolvedValue(undefined); base.select.mockResolvedValue(undefined); base.remove.mockResolvedValue(true);
    hook.mockReturnValue(base);
  });

  it("показывает empty и скрывает workspace", async () => {
    render(<HhWorkspace />);
    expect(screen.getByText("Подключите аккаунт HeadHunter")).toBeInTheDocument();
    expect(screen.queryByText("Вакансии")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Подключить HH" }));
    expect(base.connect).toHaveBeenCalledOnce();
  });

  it("показывает активный профиль в trigger и dropdown под ним", async () => {
    hook.mockReturnValue(multiple); render(<HhWorkspace />);
    const trigger = screen.getByRole("button", { name: "Активный аккаунт HH: Анна" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu"); expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Управление аккаунтами HH" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: /Анна\s*Активен/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("menuitem", { name: "Борис" })).toBeVisible();
  });

  it("выбирает другой профиль и добавляет аккаунт из меню", async () => {
    hook.mockReturnValue(multiple); render(<HhWorkspace />);
    const trigger = screen.getByRole("button", { name: /HH: Анна/ });
    await userEvent.click(trigger); await userEvent.click(screen.getByRole("menuitem", { name: "Борис" }));
    expect(base.select).toHaveBeenCalledWith("2"); expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger); await userEvent.click(screen.getByRole("menuitem", { name: "Добавить аккаунт" }));
    expect(base.connect).toHaveBeenCalledOnce();
  });

  it("открывает modal без DELETE и отменяет с возвратом фокуса", async () => {
    hook.mockReturnValue(multiple); render(<HhWorkspace />);
    const trigger = screen.getByRole("button", { name: /HH: Анна/ });
    await userEvent.click(trigger); await userEvent.click(screen.getByRole("menuitem", { name: "Удалить аккаунт" }));
    const dialog = screen.getByRole("dialog", { name: "Удалить аккаунт HH?" });
    expect(dialog).toHaveAttribute("aria-modal", "true"); expect(dialog).toHaveTextContent("«Анна»"); expect(base.remove).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("подтверждает удаление одним запросом и сохраняет modal при ошибке", async () => {
    base.remove.mockResolvedValueOnce(false).mockResolvedValueOnce(true); hook.mockReturnValue(multiple); render(<HhWorkspace />);
    await userEvent.click(screen.getByRole("button", { name: /HH: Анна/ })); await userEvent.click(screen.getByRole("menuitem", { name: "Удалить аккаунт" }));
    await userEvent.click(screen.getByRole("button", { name: "Удалить" })); expect(base.remove).toHaveBeenCalledTimes(1); expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Удалить" })); expect(base.remove).toHaveBeenCalledTimes(2); await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument()); await waitFor(() => expect(screen.getByRole("button", { name: /HH: Анна/ })).toHaveFocus());
  });

  it("синхронно блокирует двойной submit до React commit и разрешает retry после ошибки", async () => {
    let resolveRemove!: (value: boolean) => void;
    base.remove.mockReturnValueOnce(new Promise<boolean>((resolve) => { resolveRemove = resolve; })).mockResolvedValueOnce(true);
    hook.mockReturnValue(multiple); render(<HhWorkspace />);
    await userEvent.click(screen.getByRole("button", { name: /HH: Анна/ })); await userEvent.click(screen.getByRole("menuitem", { name: "Удалить аккаунт" }));
    const submit = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(submit); fireEvent.click(submit); fireEvent.keyDown(submit, { key: "Enter" });
    expect(base.remove).toHaveBeenCalledTimes(1); expect(screen.getByRole("button", { name: "Удаляем…" })).toBeDisabled();
    resolveRemove(false); await waitFor(() => expect(screen.getByRole("button", { name: "Удалить" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "Удалить" })); expect(base.remove).toHaveBeenCalledTimes(2); await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("закрывает modal по backdrop и возвращает фокус в trigger", async () => {
    hook.mockReturnValue(multiple); render(<HhWorkspace />); const trigger = screen.getByRole("button", { name: /HH: Анна/ });
    await userEvent.click(trigger); await userEvent.click(screen.getByRole("menuitem", { name: "Удалить аккаунт" }));
    const overlay = screen.getByRole("dialog").parentElement!; fireEvent.pointerDown(overlay);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); await waitFor(() => expect(trigger).toHaveFocus()); expect(base.remove).not.toHaveBeenCalled();
  });

  it("сохраняет focus intent через loading-unmount и фокусирует новый trigger", async () => {
    let resolveRemove!: (value: boolean) => void;
    let state = { ...multiple, remove: vi.fn(() => new Promise<boolean>((resolve) => { resolveRemove = resolve; })) };
    hook.mockImplementation(() => state);
    const view = render(<HhWorkspace />);
    await userEvent.click(screen.getByRole("button", { name: /HH: Анна/ })); await userEvent.click(screen.getByRole("menuitem", { name: "Удалить аккаунт" })); fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
    state = { ...state, loading: true }; view.rerender(<HhWorkspace />); expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: /HH:/ })).not.toBeInTheDocument();
    await act(async () => { resolveRemove(true); });
    state = { ...state, loading: false, accounts: [boris], activeId: "2" }; view.rerender(<HhWorkspace />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Активный аккаунт HH: Борис" })).toHaveFocus());
  });

  it("блокирует повторный submit в pending", async () => {
    hook.mockReturnValue({ ...multiple, pending: true }); render(<HhWorkspace />);
    expect(screen.getByRole("button", { name: /HH: Анна/ })).toBeDisabled();
  });

  it("закрывает menu с Escape/outside и перемещает фокус с клавиатуры", async () => {
    hook.mockReturnValue(multiple); render(<HhWorkspace />); const trigger = screen.getByRole("button", { name: /HH: Анна/ });
    trigger.focus(); await userEvent.keyboard("{ArrowDown}"); await waitFor(() => expect(screen.getByRole("menuitem", { name: /Анна/ })).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}"); expect(screen.getByRole("menuitem", { name: "Борис" })).toHaveFocus();
    await userEvent.keyboard("{Escape}"); expect(screen.queryByRole("menu")).not.toBeInTheDocument(); await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger); fireEvent.pointerDown(document.body); expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("закрывает dialog по Escape и показывает error/retry", async () => {
    hook.mockReturnValue({ ...multiple, error: "Сеть" }); render(<HhWorkspace />);
    expect(screen.getByRole("alert")).toHaveTextContent("Сеть"); await userEvent.click(screen.getByRole("button", { name: "Повторить" })); expect(base.load).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: /HH: Анна/ })); await userEvent.click(screen.getByRole("menuitem", { name: "Удалить аккаунт" })); await waitFor(() => expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus()); await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); expect(base.remove).not.toHaveBeenCalled();
  });

  it("меняет панели с клавиатуры", () => {
    hook.mockReturnValue({ ...base, accounts: [anna], activeId: "1" }); const { container } = render(<HhWorkspace />);
    const workspace = container.querySelector(".workspace")!; expect(workspace).toHaveStyle("--left-pane: 46%"); fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" }); expect(workspace).toHaveStyle("--left-pane: 50%");
  });
});
