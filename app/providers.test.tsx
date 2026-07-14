import { act, render, screen, waitFor } from "@testing-library/react";
import { useTheme } from "@mui/material";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setSystemDarkMode } from "@/test/setup";
import { AppProviders } from "./providers";

vi.mock("@mui/material-nextjs/v15-appRouter",()=>({AppRouterCacheProvider:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock("@/features/auth/auth-provider",()=>({AuthProvider:({children}:{children:React.ReactNode})=><>{children}</>}));
function Probe(){const theme=useTheme();return <span data-testid="mode">{theme.palette.mode}</span>}

describe("AppProviders",()=>{
 beforeEach(()=>setSystemDarkMode(false));
 it("следует системной теме и обновляется без reload",async()=>{render(<AppProviders><Probe/></AppProviders>);expect(screen.getByTestId("mode")).toHaveTextContent("light");act(()=>setSystemDarkMode(true));await waitFor(()=>expect(screen.getByTestId("mode")).toHaveTextContent("dark"))});
});
