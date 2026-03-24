/**
 * useAuth – authentication state and actions.
 * Manages sign-in/out flow, profile switching, and session persistence
 * via localStorage. Always resets to the demo user on page load so the
 * landing page remains the entry point.
 */

import { useState, useEffect } from 'react';
import { mockUsers, DEMO_USER_ID } from '../mock';
import { User } from '../types';

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInPage, setShowSignInPage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(DEMO_USER_ID);

  const users: User[] = mockUsers;

  let currentUser = users.find((user) => user.id === currentUserId);
  if (!currentUser) {
    currentUser = users[0];
  }

  // Always clear auth on page load — landing page is the entry point
  useEffect(() => {
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('currentUserId');
    setIsSignedIn(false);
    setCurrentUserId(DEMO_USER_ID);
  }, []);

  const handleSignIn = (_username: string, _password: string) => {
    setIsSignedIn(true);
    setShowSignInPage(false);
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUserId', currentUserId);
  };

  const handleLogout = () => {
    setIsSignedIn(false);
    setShowSignInPage(false);
    setCurrentUserId(DEMO_USER_ID);
    localStorage.setItem('isSignedIn', 'false');
    localStorage.setItem('currentUserId', DEMO_USER_ID);
  };

  const handleGoToSignIn = () => setShowSignInPage(true);
  const handleBackToLanding = () => setShowSignInPage(false);

  const handleSwitchProfile = (userIdToSwitchTo: string) => {
    setCurrentUserId(userIdToSwitchTo);
    localStorage.setItem('currentUserId', userIdToSwitchTo);
  };

  return {
    isSignedIn,
    showSignInPage,
    currentUserId,
    currentUser,
    users,
    handleSignIn,
    handleLogout,
    handleGoToSignIn,
    handleBackToLanding,
    handleSwitchProfile,
  };
}
