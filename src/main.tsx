/**
 * main – application entry point.
 * Mounts the root React component into the DOM.
 */
import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  