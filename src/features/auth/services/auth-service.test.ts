import { beforeEach, describe,expect,it,vi } from "vitest";import { apiRequest } from "@/api/main-be";import { authService } from "./auth-service";vi.mock("@/api/main-be",()=>({apiRequest:vi.fn()}));
describe("auth service",()=>{
  beforeEach(()=>vi.mocked(apiRequest).mockReset());
  it("точно сериализует email/password для регистрации и входа",async()=>{
    await authService.register({email:"a@b.ru",password:"password1"});
    expect(apiRequest).toHaveBeenNthCalledWith(1,"/api/auth/register",{method:"POST",body:JSON.stringify({email:"a@b.ru",password:"password1"})});
    await authService.login({email:"a@b.ru",password:"password1"});
    expect(apiRequest).toHaveBeenNthCalledWith(2,"/api/auth/token",{method:"POST",body:JSON.stringify({email:"a@b.ru",password:"password1"})});
    expect(JSON.parse(String(vi.mocked(apiRequest).mock.calls[0][1]?.body))).not.toHaveProperty("username");
    expect(JSON.parse(String(vi.mocked(apiRequest).mock.calls[1][1]?.body))).not.toHaveProperty("login");
  });
  it("сохраняет orchestration refresh и verify",async()=>{await authService.refresh();await authService.verify();expect(vi.mocked(apiRequest).mock.calls.map(x=>x[0])).toEqual(["/api/auth/refresh","/api/auth/verify"])});
  it("отправляет logout через существующий main-be endpoint",async()=>{await authService.logout();expect(apiRequest).toHaveBeenCalledWith("/api/auth/logout",{method:"POST"})});
});
