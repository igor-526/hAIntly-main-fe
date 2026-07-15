import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPageFeature } from "./login-page";
type Status = "checking" | "authenticated" | "anonymous" | "error";
const replace = vi.fn();
const auth: { status: Status; check: ReturnType<typeof vi.fn>; error?: string } = { status: "checking", check: vi.fn() };
vi.mock("next/navigation",()=>({useRouter:()=>({replace})}));
vi.mock("@/contexts/auth-context",()=>({useAuth:()=>auth}));
vi.mock("./auth-form",()=>({AuthForm:()=> <div>Форма входа</div>}));
describe("route gates",()=>{
  beforeEach(()=>{replace.mockReset();auth.check.mockReset();auth.status="checking";delete auth.error});
  it("перенаправляет authenticated с login",async()=>{auth.status="authenticated";render(<LoginPageFeature/>);await waitFor(()=>expect(replace).toHaveBeenCalledWith("/"))});
  it("показывает login гостю",()=>{auth.status="anonymous";render(<LoginPageFeature/>);expect(screen.getByText("Форма входа")).toBeInTheDocument()});
});
