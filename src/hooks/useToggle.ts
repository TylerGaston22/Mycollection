/**
 * useToggle – simple boolean state + toggle/set helpers.
 *
 * Replaces the repeated `useState(false)` + manually-typed
 * `setValue((v) => !v)` pattern. Use this when the boolean is a flag
 * (a panel open/closed, a section expanded/collapsed) — not when the
 * value has other states (loading/error/success).
 *
 * Example:
 *   const expanded = useToggle();
 *   <button onClick={expanded.toggle}>{expanded.value ? 'Hide' : 'Show'}</button>
 */

import { useCallback, useState } from "react";

export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  set: (next: boolean) => void;
  on: () => void;
  off: () => void;
}

export function useToggle(initial = false): UseToggleReturn {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  return { value, toggle, set: setValue, on, off };
}
