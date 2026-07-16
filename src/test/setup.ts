import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
process.env.NEXT_PUBLIC_API_BASE_URL = "http://main-be.test";
let darkMode = false;
const listeners = new Set<(event: MediaQueryListEvent) => void>();
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: query === "(prefers-color-scheme: dark)" && darkMode,
    media: query,
    onchange: null,
    addListener: (listener) => {
      if (listener) listeners.add(listener);
    },
    removeListener: (listener) => {
      if (listener) listeners.delete(listener);
    },
    addEventListener: (_: string, listener: EventListenerOrEventListenerObject) => listeners.add(listener as (event: MediaQueryListEvent) => void),
    removeEventListener: (_: string, listener: EventListenerOrEventListenerObject) => listeners.delete(listener as (event: MediaQueryListEvent) => void),
    dispatchEvent: () => true,
  }),
});
export function setSystemDarkMode(value: boolean) {
  darkMode = value;
  listeners.forEach((listener) =>
    listener({
      matches: value,
      media: "(prefers-color-scheme: dark)",
    } as MediaQueryListEvent),
  );
}
afterEach(cleanup);
