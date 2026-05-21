/**
 * useAuth – authentication state and actions.
 * Supports two modes:
 *   1. Demo user – mock data via localStorage (no Supabase needed)
 *   2. Real user – Supabase Auth with email/password
 */

import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '../lib/supabase';
import { mockUsers, DEMO_USER_ID, DEMO_CREDENTIALS } from '../demo';
import { isSyntheticEmail, isValidEmailFormat, resolveSignInEmail, usernameToSyntheticEmail, validateUsername } from '../auth';
import { User } from '../types';

export type SignUpMode = 'email' | 'username';

const DEMO_MODE = 'demo';
const DEMO_SESSION_KEY = 'mycollection.demoSignedIn';

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInPage, setShowSignInPage] = useState(false);
  const [showPasswordResetPage, setShowPasswordResetPage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(DEMO_USER_ID);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'demo' | 'supabase'>(DEMO_MODE);

  // Check for existing Supabase session on mount (falls back to persisted demo session)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await loadProfile(session.user.id, session.user.email || '');
        setCurrentUserId(session.user.id);
        setCurrentUser(profile);
        setIsSignedIn(true);
        setAuthMode('supabase');
      } else if (localStorage.getItem(DEMO_SESSION_KEY) === '1') {
        setIsSignedIn(true);
        setCurrentUserId(DEMO_USER_ID);
        setCurrentUser(mockUsers[0]);
        setAuthMode(DEMO_MODE);
      }
      setIsLoading(false);
    };
    checkSession();

    // Listen for auth state changes (e.g. token refresh, sign out from another tab,
    // password-recovery link click)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        // User just clicked a reset-password link in their email. Hydrate the
        // user state AND force the reset-password page on top so they're
        // prompted to set a new password before going back to the main app.
        const profile = await loadProfile(session.user.id, session.user.email || '');
        setCurrentUserId(session.user.id);
        setCurrentUser(profile);
        setIsSignedIn(true);
        setAuthMode('supabase');
        setShowPasswordResetPage(true);
      } else if (event === 'SIGNED_IN' && session) {
        const profile = await loadProfile(session.user.id, session.user.email || '');
        setCurrentUserId(session.user.id);
        setCurrentUser(profile);
        setIsSignedIn(true);
        setAuthMode('supabase');
      } else if (event === 'SIGNED_OUT') {
        setIsSignedIn(false);
        setCurrentUserId(DEMO_USER_ID);
        setCurrentUser(mockUsers[0]);
        setAuthMode(DEMO_MODE);
        setShowPasswordResetPage(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load or create a profile row for a Supabase user
  const loadProfile = async (userId: string, email: string): Promise<User> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // PGRST116 = "no rows" — expected when the trigger hasn't fired yet;
    // fall through to the synthesized fallback profile silently.
    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load profile', { description: error.message });
    }

    // Synthetic emails are an implementation detail — don't expose them in
    // the displayed profile. For username-only users we surface no email
    // and let the name/username carry their identity.
    const isSynthetic = isSyntheticEmail(email);
    const displayEmail = isSynthetic ? '' : email;
    const localPart = email.split('@')[0];

    if (data) {
      return {
        id: data.id,
        name: data.name || localPart,
        username: data.username || localPart,
        bio: data.bio || '',
        location: data.location || '',
        profileImage: data.profile_image || undefined,
        email: displayEmail,
        joinDate: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
    }

    // Fallback if profile doesn't exist yet (trigger may not have fired)
    return {
      id: userId,
      name: localPart,
      username: localPart,
      bio: '',
      location: '',
      email: displayEmail,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  };

  const handleSignIn = async (emailOrUsername: string, password: string) => {
    // Demo account shortcut
    if (emailOrUsername === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      localStorage.setItem(DEMO_SESSION_KEY, '1');
      setIsSignedIn(true);
      setShowSignInPage(false);
      setCurrentUserId(DEMO_USER_ID);
      setCurrentUser(mockUsers[0]);
      setAuthMode(DEMO_MODE);
      return;
    }

    // Real Supabase sign-in — accepts either an email or a bare username.
    // Username inputs get mapped to their synthetic email address.
    const { error } = await supabase.auth.signInWithPassword({
      email: resolveSignInEmail(emailOrUsername),
      password,
    });

    if (error) {
      toast.error('Sign in failed', { description: error.message });
      return;
    }

    // Leave showSignInPage=true so App.tsx keeps the SignInPage mounted
    // with the spinner running until data hydration completes. App.tsx
    // swaps to SidebarLayout once isSignedIn && allDataReady.
    toast.success('Signed in successfully!');
  };

  const handleSignUp = async (
    identifier: string,
    password: string,
    name: string,
    mode: SignUpMode = 'email',
  ) => {
    let authEmail: string;
    let storedUsername: string;

    if (mode === 'username') {
      const result = validateUsername(identifier);
      if (!result.ok) {
        toast.error('Sign up failed', { description: result.error });
        return;
      }
      const normalised = identifier.trim().toLowerCase();
      authEmail = usernameToSyntheticEmail(normalised);
      storedUsername = normalised;
    } else {
      authEmail = identifier.trim();
      // Email signups don't get a username — they identify by email, and
      // loadProfile falls back to the email's local-part for display.
      // (Avoids unique-constraint collisions when an unrelated username-only
      // user already owns the same local-part string.)
      storedUsername = '';
    }

    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { name, username: storedUsername },
      },
    });

    if (error) {
      // The handle_new_user trigger may have failed on the username unique
      // constraint. Surface a friendlier message when that's the case.
      const isDuplicate = /duplicate|unique|already/i.test(error.message);
      toast.error('Sign up failed', {
        description: isDuplicate
          ? 'That username is already taken — try a different one.'
          : error.message,
      });
      return;
    }

    if (mode === 'username') {
      toast.success('Account created!', {
        description:
          'No email on file — save your password somewhere safe, lost passwords cannot be recovered.',
      });
    } else {
      toast.success('Account created!', { description: 'Check your email to confirm your account.' });
    }
  };

  // Update editable profile fields. Currently exposed: `name`.
  // Demo users update in-memory only (mockUsers); Supabase users hit the
  // profiles table. Returns true on success so callers can clear "dirty" UI.
  const handleUpdateProfile = async (updates: { name?: string }): Promise<boolean> => {
    const trimmed: { name?: string } = {};
    if (typeof updates.name === 'string') trimmed.name = updates.name.trim();

    if (!trimmed.name) {
      toast.error('Name cannot be empty');
      return false;
    }

    if (authMode === DEMO_MODE) {
      setCurrentUser((prev) => ({ ...prev, ...trimmed }));
      toast.success('Profile updated');
      return true;
    }

    const { error } = await supabase
      .from('profiles')
      .update(trimmed)
      .eq('id', currentUserId);

    if (error) {
      toast.error('Failed to update profile', { description: error.message });
      return false;
    }

    setCurrentUser((prev) => ({ ...prev, ...trimmed }));
    toast.success('Profile updated');
    return true;
  };

  // Change the Supabase Auth email. Sends a confirmation link to the NEW
  // address; the change only takes effect once that link is clicked.
  // (Supabase may also confirm to the OLD address depending on project
  // settings, as a defense against takeover via stolen session.)
  // Not available for demo users or username-only accounts.
  const handleUpdateEmail = async (newEmail: string): Promise<boolean> => {
    const trimmed = newEmail.trim();

    if (!isValidEmailFormat(trimmed)) {
      toast.error('That doesn\'t look like a valid email address.');
      return false;
    }

    if (isSyntheticEmail(trimmed)) {
      // Don't let users masquerade their email as one of our synthetic
      // addresses — that would let them "become" a username-only user
      // via a route that bypasses the username uniqueness check.
      toast.error('Pick a real email address.');
      return false;
    }

    if (authMode === DEMO_MODE) {
      toast.error('Email changes are not available for the demo account.');
      return false;
    }

    const { error } = await supabase.auth.updateUser({ email: trimmed });

    if (error) {
      toast.error('Failed to update email', { description: error.message });
      return false;
    }

    toast.success('Confirmation email sent', {
      description: 'Check your new email and click the link to confirm the change.',
    });
    return true;
  };

  // Send a password-reset email. The link in the email lands the user
  // back at our app and fires the PASSWORD_RECOVERY auth event, which
  // pops the ResetPasswordPage on top of the main app.
  const handleResetPasswordRequest = async (emailOrUsername: string): Promise<boolean> => {
    const trimmed = emailOrUsername.trim();

    if (!trimmed.includes('@')) {
      toast.error('Password reset is not available', {
        description: 'Username-only accounts have no email to send a reset link to. If you remember your password, sign in normally.',
      });
      return false;
    }

    if (!isValidEmailFormat(trimmed)) {
      toast.error('That doesn\'t look like a valid email address.');
      return false;
    }

    if (isSyntheticEmail(trimmed)) {
      toast.error('Password reset is not available for this account.');
      return false;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: window.location.origin,
    });

    if (error) {
      toast.error('Failed to send reset email', { description: error.message });
      return false;
    }

    toast.success('Reset link sent', {
      description: 'Check your email for a password reset link. (Note: Supabase always shows success here, even for unknown emails — that\'s privacy protection.)',
    });
    return true;
  };

  // Set a new password — called from ResetPasswordPage during the recovery
  // flow, AND can be reused for an in-app "change password" feature later.
  const handleChangePassword = async (newPassword: string): Promise<boolean> => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return false;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error('Failed to update password', { description: error.message });
      return false;
    }

    setShowPasswordResetPage(false);
    toast.success('Password updated', { description: 'You\'re all set — signed in with your new password.' });
    return true;
  };

  const handleLogout = async () => {
    // Reset local state first so the UI reflects logout instantly,
    // regardless of whether the Supabase signOut request hangs.
    const wasSupabaseSession = authMode === 'supabase';
    localStorage.removeItem(DEMO_SESSION_KEY);
    setIsSignedIn(false);
    setShowSignInPage(false);
    setCurrentUserId(DEMO_USER_ID);
    setCurrentUser(mockUsers[0]);
    setAuthMode(DEMO_MODE);

    // Then clear the Supabase session in the background (best-effort).
    if (wasSupabaseSession) {
      supabase.auth.signOut().catch(() => {
        // Swallow — local state is already cleared; if the token couldn't
        // be invalidated server-side, it will expire on its own.
      });
    }
  };

  const handleGoToSignIn = () => setShowSignInPage(true);
  const handleBackToLanding = () => setShowSignInPage(false);

  const isDemoUser = authMode === DEMO_MODE;

  return {
    isSignedIn,
    showSignInPage,
    currentUserId,
    currentUser,
    isLoading,
    isDemoUser,
    handleSignIn,
    handleSignUp,
    handleLogout,
    handleGoToSignIn,
    handleBackToLanding,
    handleUpdateProfile,
    handleUpdateEmail,
    handleResetPasswordRequest,
    handleChangePassword,
    showPasswordResetPage,
  };
}
