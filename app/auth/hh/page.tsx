import { Suspense } from "react";
import { HhOAuthCallback } from "@/features/hh-accounts/oauth-callback";

export default function Page() {
  return (
    <Suspense fallback={<main className="callback-page">Завершаем подключение HH…</main>}>
      <HhOAuthCallback />
    </Suspense>
  );
}
