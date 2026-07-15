"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { hhAccountService } from "./service";

export function OAuthCallbackPage() {
  return <Suspense fallback={<main className="callback-page">Завершаем подключение HH…</main>}><HhOAuthCallback /></Suspense>;
}

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
  return <Box component="main" sx={{minHeight:"100vh",display:"grid",placeItems:"center",p:2,bgcolor:"background.default"}}><Paper role="status" sx={{p:4,maxWidth:520,textAlign:"center"}}><Stack spacing={2} sx={{alignItems:"center"}}>{result.status==="pending"&&<CircularProgress/>}<Typography variant="h4" color="primary" sx={{fontWeight:800}}>HAIntly</Typography>{result.status==="error"?<Alert severity="error">{result.message}</Alert>:<Typography>{result.message}</Typography>}{result.status === "error" && <Button variant="contained" onClick={() => window.close()}>Закрыть окно</Button>}</Stack></Paper></Box>;
}
