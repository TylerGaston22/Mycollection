/**
 * useIsMobile – returns true when the device is actually a phone, not
 * just a narrow desktop window.
 *
 * Why not width-based? A 500px-wide desktop browser is still a desktop
 * experience (fine pointer, hover, scrollbars, etc.) and shouldn't get
 * the mobile-only layout. Detecting `(pointer: coarse) and (hover: none)`
 * matches phones (and most tablets) while leaving every desktop browser
 * — at any window size — on the desktop layout.
 *
 * The desktop layout is expected to scale down fluidly via Tailwind
 * responsive utilities; this hook is ONLY for the "should we swap to
 * the dedicated MobileMainContent / MobileBottomNav components" call.
 */

import { useState, useEffect } from 'react';

const MOBILE_QUERY = '(pointer: coarse) and (hover: none)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    setIsMobile(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}
