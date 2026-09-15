"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("castcheck-theme", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("castcheck-theme", callback);
  };
}
function snapshot() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light");
  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch { /* Theme still works without storage. */ }
    window.dispatchEvent(new Event("castcheck-theme"));
  }
  return <button onClick={toggle} aria-label="Toggle theme"
    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
    {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
  </button>;
}
