/**
 * main – application entry point.
 * Mounts the root React component into the DOM.
 */
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./styles/index.css";

// Apply the cached surface theme to <html> SYNCHRONOUSLY before React
// mounts, so refreshing the page doesn't flash the default (dark) chrome
// before Supabase preferences load. App.tsx keeps this cache in sync
// every time the user toggles the surface theme.
try {
  // Accept both 'coffee' (current) and the legacy 'bookstore' value, which
  // was the original name for this theme before the rename. Existing users
  // have 'bookstore' in localStorage / Supabase prefs; usePreferences
  // migrates the in-memory state on load, and the next toggle/save flushes
  // 'coffee' back out — but the synchronous hydration here happens BEFORE
  // React mounts, so it has to handle the legacy value too.
  const stored = localStorage.getItem('surfaceTheme');
  if (stored === 'coffee' || stored === 'bookstore') {
    document.documentElement.setAttribute('data-surface', 'coffee');
  }
} catch {
  // localStorage disabled (private mode) — fall through; brief flash on
  // refresh in that environment is acceptable.
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <App />
  </ThemeProvider>,
);
