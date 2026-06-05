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
  if (localStorage.getItem('surfaceTheme') === 'bookstore') {
    document.documentElement.setAttribute('data-surface', 'bookstore');
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
