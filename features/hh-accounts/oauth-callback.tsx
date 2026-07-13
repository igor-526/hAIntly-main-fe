"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hhAccountService } from "./service";

export function HhOAuthCallback() {
  const query = useSearchParams();
  const queryString = query.toString();
  const [result, setResult] = useState<{ status: "pending" | "success" | "error"; message: string }>({ status: "pending", message: "Завершаем подключение HH…" });
  useEffect(() => {
    let active = true;
    async function complete() {
      try {
        const response = await hhAccountService.callback(new URLSearchParams(queryString));
        if (!active) return;
        if (!response.success) { setResult({ status: "error", message: response.message || "Не удалось подключить аккаунт HH." }); return; }
        setResult({ status: "success", message: "Аккаунт HH подключён. Окно закрывается…" });
        const opener = window.opener;
        if (opener && opener !== window) {
          opener.postMessage({ type: "haintly:hh-oauth-success" }, window.location.origin);
          window.setTimeout(() => window.close(), 150);
        }
      } catch (error) {
        if (active) setResult({ status: "error", message: error instanceof Error ? error.message : "Не удалось подключить аккаунт HH." });
      }
    }
    void complete();
    return () => { active = false; };
  }, [queryString]);
  return <main className="callback-page"><section role="status" className="callback-card"><h1>HAIntly</h1><p>{result.message}</p>{result.status === "error" && <button onClick={() => window.close()}>Закрыть окно</button>}</section></main>;
}
