/**
 * SessionContext – makes the signed-in identity readable from anywhere
 * in the tree without threading props through every layer.
 *
 * Added for note-image uploads. The notes editor appears in two places:
 * the Add/Edit dialog (rendered straight from App.tsx) and the
 * QuickEditDialog, which sits four components deep — App → SidebarLayout
 * → Desktop/MobileMainContent → ListView. Uploading needs the user id
 * (it's the storage folder name, and the bucket RLS checks it) plus
 * whether this is a demo user. Drilling two props down both branches to
 * reach one dialog isn't worth it; the identity is genuinely global
 * state, so it reads from context instead.
 *
 * This stays deliberately small: identity only. Collection data keeps
 * flowing as props, which is what makes the data flow easy to follow.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface SessionValue {
  /** The current user's id — the Supabase auth uid for real users. */
  userId: string;
  /** True for the localStorage-backed demo user. */
  isDemoUser: boolean;
  /**
   * Whether this session may upload to Supabase Storage. Demo users
   * have no auth identity, so bucket RLS would reject the write —
   * upload affordances hide for them rather than failing on click.
   * Same rule the avatar upload in ProfileDialog already follows.
   */
  canUploadImages: boolean;
}

/**
 * Default is a signed-out, upload-incapable session so a component
 * rendered outside the provider (a test, a story) degrades to
 * "no upload UI" instead of throwing.
 */
const SIGNED_OUT_SESSION: SessionValue = {
  userId: '',
  isDemoUser: true,
  canUploadImages: false,
};

const SessionContext = createContext<SessionValue>(SIGNED_OUT_SESSION);

export function SessionProvider({
  userId,
  isDemoUser,
  children,
}: {
  userId: string;
  isDemoUser: boolean;
  children: ReactNode;
}) {
  const value = useMemo<SessionValue>(
    () => ({ userId, isDemoUser, canUploadImages: !isDemoUser && !!userId }),
    [userId, isDemoUser],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
