/**
 * useAuth – authentication state and actions.
 * Supports two modes:
 *   1. Demo user – mock data via localStorage (no Supabase needed)
 *   2. Real user – Supabase Auth with email/password
 */

import { useState, useEffect } from 'react';
import { toast } from "sonner@2.0.3";
import { supabase } from '../lib/supabase';
import { mockUsers, DEMO_USER_ID, DEMO_CREDENTIALS } from '../demo';
import { User } from '../types';

const DEMO_MODE = 'demo';
const DEMO_SESSION_KEY = 'mycollection.demoSignedIn';

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInPage, setShowSignInPage] = useState(false);
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

    // Listen for auth state changes (e.g. token refresh, sign out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load or create a profile row for a Supabase user
  const loadProfile = async (userId: string, email: string): Promise<User> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      return {
        id: data.id,
        name: data.name || email.split('@')[0],
        username: data.username || `@${email.split('@')[0]}`,
        bio: data.bio || '',
        location: data.location || '',
        profileImage: data.profile_image || undefined,
        email,
        joinDate: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
    }

    // Fallback if profile doesn't exist yet (trigger may not have fired)
    return {
      id: userId,
      name: email.split('@')[0],
      username: `@${email.split('@')[0]}`,
      bio: '',
      location: '',
      email,
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

    // Real Supabase sign-in
    const { error } = await supabase.auth.signInWithPassword({
      email: emailOrUsername,
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

  const handleSignUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username: `@${email.split('@')[0]}` },
      },
    });

    if (error) {
      toast.error('Sign up failed', { description: error.message });
      return;
    }

    toast.success('Account created!', { description: 'Check your email to confirm your account.' });
  };

  const handleLogout = async () => {
    if (authMode === 'supabase') {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
    setIsSignedIn(false);
    setShowSignInPage(false);
    setCurrentUserId(DEMO_USER_ID);
    setCurrentUser(mockUsers[0]);
    setAuthMode(DEMO_MODE);
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
  };
}
