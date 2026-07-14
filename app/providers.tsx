"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "@/features/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (event: MediaQueryListEvent | MediaQueryList) => setDark(event.matches);
    update(media); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const theme = useMemo(() => createTheme({
    palette: { mode: dark ? "dark" : "light", primary: { main: "#5b5bd6" } },
    shape: { borderRadius: 12 },
    typography: { fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
    components: { MuiButton: { defaultProps: { disableElevation: true } } },
  }), [dark]);

  return <AppRouterCacheProvider options={{ enableCssLayer: true }}>
    <ThemeProvider theme={theme}><CssBaseline /><AuthProvider>{children}</AuthProvider></ThemeProvider>
  </AppRouterCacheProvider>;
}
