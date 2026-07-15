import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLogin } from "./use-login";
import { authService } from "../services/auth-service";
const replace=vi.fn();const check=vi.fn();
vi.mock("next/navigation",()=>({useRouter:()=>({replace})}));
vi.mock("@/contexts/auth-context",()=>({useAuth:()=>({check})}));
vi.mock("../services/auth-service",()=>({authService:{register:vi.fn(),login:vi.fn()}}));
describe("useLogin",()=>{
 beforeEach(()=>{replace.mockReset();check.mockReset();vi.mocked(authService.register).mockReset();vi.mocked(authService.login).mockReset()});
 it("регистрирует без auto-login и переносит email",async()=>{vi.mocked(authService.register).mockResolvedValue(void 0);const {result}=renderHook(()=>useLogin());act(()=>{result.current.switchMode("register");result.current.setRegister({email:"a@b.ru",password:"password1"})});await act(async()=>result.current.submit());expect(authService.register).toHaveBeenCalledWith({email:"a@b.ru",password:"password1"});expect(authService.login).not.toHaveBeenCalled();expect(result.current.mode).toBe("login");expect(result.current.login.email).toBe("a@b.ru");expect(result.current.success).toContain("Пользователь создан")});
 it("после login проверяет session и навигирует",async()=>{vi.mocked(authService.login).mockResolvedValue(void 0);check.mockResolvedValue(true);const {result}=renderHook(()=>useLogin());act(()=>result.current.setLogin({email:"tester@example.test",password:"password1"}));await act(async()=>result.current.submit());expect(check).toHaveBeenCalledOnce();expect(replace).toHaveBeenCalledWith("/")});
 it("не отправляет невалидную форму",async()=>{const {result}=renderHook(()=>useLogin());await act(async()=>result.current.submit());expect(authService.login).not.toHaveBeenCalled();expect(result.current.errors.email).toBeTruthy()});
 it("показывает backend error и блокирует повторный pending submit",async()=>{let reject!:()=>void;vi.mocked(authService.login).mockReturnValue(new Promise((_,r)=>{reject=()=>r(new Error("Неверные данные"))}));const {result}=renderHook(()=>useLogin());act(()=>result.current.setLogin({email:"tester@example.test",password:"password1"}));let first!:Promise<void>;act(()=>{first=result.current.submit()});await waitFor(()=>expect(result.current.pending).toBe(true));await act(async()=>result.current.submit());expect(authService.login).toHaveBeenCalledOnce();reject();await act(async()=>first);expect(result.current.submitError).toBe("Неверные данные");expect(result.current.pending).toBe(false)});
});
