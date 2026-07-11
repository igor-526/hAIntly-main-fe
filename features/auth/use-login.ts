"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { authService } from "./service";
import type { FieldErrors, LoginData, RegisterData } from "./types";
import { validateLogin, validateRegister } from "./validators";
export function useLogin() {
  const router = useRouter(); const auth = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [login, setLogin] = useState<LoginData>({ email: "", password: "" });
  const [register, setRegister] = useState<RegisterData>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginData & RegisterData>>({});
  const [submitError, setSubmitError] = useState(""); const [success, setSuccess] = useState(""); const [pending, setPending] = useState(false);
  const switchMode = (next: "login" | "register") => { setMode(next); setLogin(v => ({ ...v, password: "" })); setRegister(v => ({ ...v, password: "" })); setErrors({}); setSubmitError(""); setSuccess(""); };
  const submit = async () => {
    if (pending) return;
    const nextErrors = mode === "login" ? validateLogin(login) : validateRegister(register); setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setPending(true); setSubmitError(""); setSuccess("");
    try {
      if (mode === "register") { await authService.register(register); setLogin({ email: register.email, password: "" }); setRegister(v => ({ ...v, password: "" })); setMode("login"); setSuccess("Пользователь создан. Теперь войдите."); }
      else { await authService.login(login); if (await auth.check()) router.replace("/"); else setSubmitError("Не удалось подтвердить сессию."); }
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Запрос не выполнен"); }
    finally { setPending(false); }
  };
  return { mode, login, register, errors, submitError, success, pending, setLogin, setRegister, switchMode, submit };
}
