import { useSyncExternalStore } from "react";

/** Whether the desktop sidebar is collapsed to its icon rail. Remembered per browser. */
const STORAGE_KEY = "dataforge.sidebar-collapsed";

function readInitial() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

let collapsed = readInitial();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSidebarCollapsed(value: boolean) {
  collapsed = value;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Storage unavailable (private mode, blocked site data): keep it in memory only.
  }
  listeners.forEach((listener) => listener());
}

export function toggleSidebar() {
  setSidebarCollapsed(!collapsed);
}

export function useSidebarCollapsed() {
  return useSyncExternalStore(subscribe, () => collapsed);
}
