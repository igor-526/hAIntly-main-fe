"use client";
import { useLogin } from "./use-login";
export function AuthForm() {
  const f = useLogin(); const field = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100";
  return <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8" aria-labelledby="auth-title">
    <h1 id="auth-title" className="mb-7 text-center text-3xl font-bold text-indigo-700">HAIntly</h1>
    <div className="mb-6 grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="Режим формы">
      {(["login", "register"] as const).map(m => <button key={m} type="button" onClick={() => f.switchMode(m)} aria-pressed={f.mode === m} className={`rounded-lg px-3 py-2 font-medium ${f.mode === m ? "bg-white text-indigo-700 shadow" : "text-slate-600"}`}>{m === "login" ? "Вход" : "Регистрация"}</button>)}
    </div>
    <form noValidate onSubmit={e => { e.preventDefault(); void f.submit(); }} className="space-y-4">
      <label className="block text-sm font-medium">Email<input aria-invalid={!!f.errors.email} className={`${field} mt-1`} type="email" autoComplete="email" value={f.mode === "login" ? f.login.email : f.register.email} onChange={e => f.mode === "login" ? f.setLogin(v => ({...v,email:e.target.value})) : f.setRegister(v => ({...v,email:e.target.value}))}/>{f.errors.email && <span className="mt-1 block text-red-700">{f.errors.email}</span>}</label>
      <label className="block text-sm font-medium">Пароль<input aria-invalid={!!f.errors.password} className={`${field} mt-1`} type="password" autoComplete={f.mode === "login" ? "current-password" : "new-password"} value={f.mode === "login" ? f.login.password : f.register.password} onChange={e => f.mode === "login" ? f.setLogin(v => ({...v,password:e.target.value})) : f.setRegister(v => ({...v,password:e.target.value}))}/>{f.errors.password && <span className="mt-1 block text-red-700">{f.errors.password}</span>}</label>
      {f.submitError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{f.submitError}</p>}{f.success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{f.success}</p>}
      <button disabled={f.pending} className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">{f.pending ? "Подождите…" : f.mode === "login" ? "Войти" : "Зарегистрироваться"}</button>
    </form>
  </section>;
}
