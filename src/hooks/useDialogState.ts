/**
 * useDialogState – manages open/close state for multiple dialogs.
 * Each dialog is keyed by a string name; the hook returns helpers
 * to query and toggle each one without scattering useState calls.
 */

import { useState, useCallback } from 'react';

export function useDialogState() {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const isOpen = useCallback((key: string) => !!openMap[key], [openMap]);
  const open = useCallback((key: string) => setOpenMap((prev) => ({ ...prev, [key]: true })), []);
  const close = useCallback((key: string) => setOpenMap((prev) => ({ ...prev, [key]: false })), []);
  const setOpen = useCallback(
    (key: string, value: boolean) => setOpenMap((prev) => ({ ...prev, [key]: value })),
    [],
  );

  return { isOpen, open, close, setOpen };
}
