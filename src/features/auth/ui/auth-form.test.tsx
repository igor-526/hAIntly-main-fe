import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";
import { authService } from "../services/auth-service";
const check=vi.fn();
vi.mock("next/navigation",()=>({useRouter:()=>({replace:vi.fn()})}));
vi.mock("@/contexts/auth-context",()=>({useAuth:()=>({check})}));
vi.mock("../services/auth-service",()=>({authService:{register:vi.fn(),login:vi.fn()}}));
async function registration(userReturn?:ReturnType<typeof authService.register>){
 if(userReturn)vi.mocked(authService.register).mockReturnValue(userReturn);else vi.mocked(authService.register).mockResolvedValue(void 0);const user=userEvent.setup();render(<AuthForm/>);await user.click(screen.getByRole("button",{name:"Регистрация"}));await user.type(screen.getByLabelText("Email"),"a@b.ru");await user.type(screen.getByLabelText("Пароль"),"password1");return user;
}
describe("AuthForm interactions",()=>{
 beforeEach(()=>{vi.mocked(authService.register).mockReset();vi.mocked(authService.login).mockReset();check.mockReset()});
 it("переключает реальные режимы",async()=>{const user=userEvent.setup();render(<AuthForm/>);await user.click(screen.getByRole("button",{name:"Регистрация"}));expect(screen.getByLabelText("Email")).toBeInTheDocument();expect(screen.getByRole("button",{name:"Зарегистрироваться"})).toBeEnabled()});
 it("показывает validation без запроса",async()=>{const user=userEvent.setup();render(<AuthForm/>);await user.click(screen.getByRole("button",{name:"Войти"}));expect(await screen.findAllByText(/Введите/)).toHaveLength(2);expect(authService.login).not.toHaveBeenCalled()});
 it("показывает email и пароль в обоих режимах",async()=>{const user=userEvent.setup();render(<AuthForm/>);expect(screen.getByLabelText("Email")).toHaveAttribute("type","email");expect(screen.getByLabelText("Пароль")).toBeInTheDocument();await user.click(screen.getByRole("button",{name:"Регистрация"}));expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete","email");expect(screen.queryByLabelText(/логин/i)).not.toBeInTheDocument()});
 it("показывает success регистрации, переносит email и не делает login",async()=>{const user=await registration();await user.click(screen.getByRole("button",{name:"Зарегистрироваться"}));expect(await screen.findByRole("status")).toHaveTextContent("Пользователь создан");expect(screen.getByLabelText("Email")).toHaveValue("a@b.ru");expect(authService.login).not.toHaveBeenCalled()});
 it("показывает backend error",async()=>{const user=await registration();vi.mocked(authService.register).mockRejectedValueOnce(new Error("Email занят"));await user.click(screen.getByRole("button",{name:"Зарегистрироваться"}));expect(await screen.findByRole("alert")).toHaveTextContent("Email занят")});
 it("блокирует submit в pending",async()=>{let resolve!:(value:undefined)=>void;const user=await registration(new Promise<undefined>(r=>{resolve=r}));await user.click(screen.getByRole("button",{name:"Зарегистрироваться"}));expect(screen.getByRole("button",{name:"Подождите…"})).toBeDisabled();expect(authService.register).toHaveBeenCalledOnce();resolve(void 0);await waitFor(()=>expect(screen.getByRole("status")).toBeInTheDocument())});
});
