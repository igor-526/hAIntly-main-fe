"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Status } from "@/ui/status";
import { HhWorkspace } from "@/features/workspace/hh-accounts/workspace";
export function HomePage() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (auth.status === "anonymous") router.replace("/login");
  }, [auth.status, router]);
  if (auth.status === "checking" || auth.status === "anonymous") return <Status text="Проверяем сессию…" />;
  if (auth.status === "error") return <Status text={auth.error || "Ошибка"} retry={auth.check} />;
  return <HhWorkspace />;
}
