/**
 * useLocalStorageState — useState that persists to localStorage.
 *
 * Drop-in replacement for `useState<string>(defaultValue)` when the
 * value should survive a refresh / re-open. The state is read from
 * localStorage on initial mount and written back any time it changes.
 *
 * Limited to string state on purpose — that's all we need (selected
 * category, active section, etc.). If we ever need objects, JSON-
 * encode them in the caller or extend this hook.
 */

import { useEffect, useState } from "react";

export function useLocalStorageState(
  key: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? defaultValue;
    } catch {
      // localStorage can throw in private-browsing / disabled contexts.
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Same — silently ignore quota / disabled-storage errors. State
      // still works in memory; it just won't persist.
    }
  }, [key, value]);

  return [value, setValue];
}
