import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { initSupabaseSync } from "@/data/supabaseSync";
import "./index.css";

// Wait for Supabase sync to complete BEFORE rendering React
// This ensures localStorage has the latest cloud data when components mount
async function boot() {
  try {
    await initSupabaseSync();
  } catch (e) {
    console.warn('Supabase sync init failed:', e);
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}

boot();
