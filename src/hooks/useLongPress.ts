/**
 * useLongPress – pointer-event-based long-press detection.
 *
 * Used by ListView (desktop table rows) and MobileListItem (mobile
 * stacked list rows) to open the notes editor when the user touches /
 * holds for ~500ms.
 *
 * Why not `oncontextmenu` or the native long-press gesture: iOS Safari
 * fires `contextmenu` inconsistently for touch-hold (especially after
 * some toolbar interactions), and desktop `contextmenu` is the
 * right-click menu we don't want to repurpose. Pointer-event timing
 * is portable across mouse + touch + pen.
 *
 * Behaviour:
 *   - pointerdown starts a timer + records the start (x, y).
 *   - pointermove cancels the timer if the user moves >`moveTolerance`
 *     pixels (treats the gesture as a drag / scroll, not a press).
 *   - pointerup / pointercancel / pointerleave clear the timer.
 *   - On timer fire, `onLongPress` runs and a flag is set so the
 *     follow-up click can suppress itself (since the click would
 *     otherwise also open the detail dialog).
 *
 * Usage:
 *   const longPress = useLongPress({ onLongPress: () => openNotes() });
 *   <div
 *     onPointerDown={longPress.onPointerDown}
 *     onPointerMove={longPress.onPointerMove}
 *     onPointerUp={longPress.onPointerUp}
 *     onPointerCancel={longPress.onPointerCancel}
 *     onPointerLeave={longPress.onPointerLeave}
 *     onClick={(event) => {
 *       if (longPress.consumeFiredFlag()) return; // suppress click after long-press
 *       openDetail();
 *     }}
 *   />
 */

import { useCallback, useRef } from "react";

export interface UseLongPressOptions {
  onLongPress: () => void;
  /** Hold duration in milliseconds. Default 500ms — feels right on
   *  touch, doesn't make right-click-and-hold awkward on desktop. */
  delayMs?: number;
  /** Max pixels of finger / cursor movement allowed before the press
   *  is cancelled (treated as a drag / scroll). Default 10. */
  moveTolerance?: number;
}

export interface LongPressHandlers {
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
  /** Returns true (and resets internally) if a long-press just fired
   *  — the caller's onClick should bail when this is true so the
   *  short-click action doesn't ALSO run. */
  consumeFiredFlag: () => boolean;
}

export function useLongPress({
  onLongPress,
  delayMs = 500,
  moveTolerance = 10,
}: UseLongPressOptions): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      firedRef.current = false;
      startRef.current = { x: event.clientX, y: event.clientY };
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, delayMs);
    },
    [onLongPress, delayMs],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!startRef.current) return;
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > moveTolerance) {
        cancel();
      }
    },
    [cancel, moveTolerance],
  );

  const consumeFiredFlag = useCallback(() => {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    consumeFiredFlag,
  };
}
