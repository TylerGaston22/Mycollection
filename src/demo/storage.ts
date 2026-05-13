/**
 * Demo storage helpers — localStorage-backed persistence for demo-mode users.
 * These are the only places demo mode touches storage; real (Supabase) users
 * never call into here.
 */

import { useEffect } from 'react';

export function loadDemoData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveDemoData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Write-through hook: keeps a value mirrored to localStorage in demo mode.
// No-op when `enabled` is false (i.e. real Supabase users).
export function useDemoSync<T>(key: string, value: T, enabled: boolean): void {
  useEffect(() => {
    if (enabled) saveDemoData(key, value);
  }, [key, value, enabled]);
}
