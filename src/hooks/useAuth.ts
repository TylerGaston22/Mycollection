import { useState, useEffect } from 'react';
import { mockUsers } from '../mock';
import { User } from '../types/user';

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInPage, setShowSignInPage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('user-demo');

  const users: User[] = mockUsers;
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Always clear auth on page load — landing page is the entry point
  useEffect(() => {
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('currentUserId');
    setIsSignedIn(false);
    setCurrentUserId('user-demo');
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
    setCurrentUserId('user-guest');
    localStorage.setItem('isSignedIn', 'false');
    localStorage.setItem('currentUserId', 'user-guest');
  };

  const handleGoToSignIn = () => setShowSignInPage(true);
  const handleBackToLanding = () => setShowSignInPage(false);

  const handleSwitchProfile = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('currentUserId', userId);
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
