/**
 * SignInPage – sign-in / sign-up form with demo account shortcut.
 * Supports real Supabase auth (email + password OR username + password)
 * and a one-click demo login that bypasses authentication entirely.
 */
import { useState } from "react";
import { DEMO_CREDENTIALS } from "../demo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PasswordInput } from "../components/ui/PasswordInput";
import { AlertBox } from "../components/ui/AlertBox";
import { DecorativeIconBox } from "../components/ui/DecorativeIconBox";
import { Sparkles, Film, Tv, UtensilsCrossed, MapPin, ArrowLeft } from "lucide-react";
import { isValidEmailFormat, validateUsername, AUTH_INPUT_CLASS, AUTH_CARD_CLASS } from "../auth";
import type { SignUpMode } from "../hooks/useAuth";

interface SignInPageProps {
  onSignIn: (emailOrUsername: string, password: string) => void;
  onSignUp?: (identifier: string, password: string, name: string, mode: SignUpMode) => void;
  onForgotPassword?: (email: string) => Promise<boolean>;
  onBack: () => void;
  // True while App.tsx is still hydrating the user's data after a
  // successful Supabase sign-in. Keeps the button spinner visible so
  // the user doesn't see a flash of the demo collection.
  externalLoading?: boolean;
}

export function SignInPage({ onSignIn, onSignUp, onForgotPassword, onBack, externalLoading = false }: SignInPageProps) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [enteredIdentifier, setEnteredIdentifier] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredName, setEnteredName] = useState("");
  const [formValidationError, setFormValidationError] = useState("");
  const [isSignInRequestLoading, setIsSignInRequestLoading] = useState(false);
  const isButtonLoading = isSignInRequestLoading || externalLoading;
  // Auto-detect mode from the identifier: contains '@' → email, otherwise → username.
  // Same rule used by sign-in via resolveSignInEmail().
  const inferredSignUpMode: SignUpMode = enteredIdentifier.includes("@") ? "email" : "username";
  const isUsernameSignUp = isSignUpMode && inferredSignUpMode === "username" && enteredIdentifier.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormValidationError("");

    if (!enteredIdentifier.trim()) {
      setFormValidationError(
        isUsernameSignUp ? "Please enter a username" : "Please enter your email or username",
      );
      return;
    }

    if (!enteredPassword.trim()) {
      setFormValidationError("Please enter your password");
      return;
    }

    if (enteredPassword.length < 6) {
      setFormValidationError("Password must be at least 6 characters");
      return;
    }

    if (isSignUpMode && !enteredName.trim()) {
      setFormValidationError("Please enter your name");
      return;
    }

    // Client-side validation per inferred mode so the user gets immediate
    // feedback instead of a Supabase error round-trip.
    if (isSignUpMode) {
      if (inferredSignUpMode === "username") {
        const result = validateUsername(enteredIdentifier);
        if (!result.ok) {
          setFormValidationError(result.error || "Invalid username");
          return;
        }
      } else if (!isValidEmailFormat(enteredIdentifier)) {
        setFormValidationError("That doesn't look like a valid email address.");
        return;
      }
    }

    setIsSignInRequestLoading(true);

    if (isSignUpMode && onSignUp) {
      await onSignUp(enteredIdentifier, enteredPassword, enteredName, inferredSignUpMode);
    } else {
      await onSignIn(enteredIdentifier, enteredPassword);
    }

    setIsSignInRequestLoading(false);
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormValidationError("");

    if (!enteredIdentifier.trim()) {
      setFormValidationError("Please enter the email you signed up with");
      return;
    }

    if (!onForgotPassword) return;

    setIsSignInRequestLoading(true);
    const ok = await onForgotPassword(enteredIdentifier);
    setIsSignInRequestLoading(false);
    if (ok) {
      // Back to sign-in mode with a clean slate so the user can sign in
      // with the new password once they've reset it.
      setIsResetMode(false);
      setEnteredIdentifier("");
      setEnteredPassword("");
    }
  };

  const handleDemoLogin = () => {
    onSignIn(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password);
  };

  let signInButtonContent: React.ReactNode;
  if (isButtonLoading) {
    let loadingLabel: string;
    if (isResetMode) loadingLabel = "Sending reset link...";
    else if (isSignUpMode) loadingLabel = "Creating account...";
    else loadingLabel = "Signing in...";
    signInButtonContent = (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>{loadingLabel}</span>
      </div>
    );
  } else if (isResetMode) {
    signInButtonContent = "Send reset link";
  } else {
    signInButtonContent = isSignUpMode ? "Create Account" : "Sign In";
  }

  // Single combined identifier field — auto-detects email vs username by '@'.
  // type="text" (not "email") so the username case isn't blocked by the
  // browser's built-in email validation.
  let identifierLabel = "Email or username";
  let identifierPlaceholder = "Enter your email or username";
  let identifierInputType = "text";
  if (isResetMode) {
    identifierLabel = "Email";
    identifierPlaceholder = "Enter your account email";
    identifierInputType = "email";
  } else if (isSignUpMode) {
    identifierPlaceholder = "Enter an email — or a username for no-email signup";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </button>

        {/* Sign In Card */}
        <div className={AUTH_CARD_CLASS}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                {isResetMode ? "Reset Password" : isSignUpMode ? "Create Account" : "Welcome Back"}
              </h1>
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-gray-300">
              {isResetMode
                ? "Enter the email you signed up with — we'll send you a reset link."
                : isSignUpMode
                  ? "Sign up to start building your collection"
                  : "Sign in to access your collection"}
            </p>
          </div>

          {/* Decorative Icons */}
          <div className="flex justify-center gap-4 mb-6">
            <DecorativeIconBox color="orange" icon={Film} />
            <DecorativeIconBox color="purple" icon={Tv} />
            <DecorativeIconBox color="blue" icon={UtensilsCrossed} />
            <DecorativeIconBox color="green" icon={MapPin} />
          </div>

          {/* Form */}
          <form onSubmit={isResetMode ? handleForgotPasswordSubmit : handleSubmit} className="space-y-5">
            {isSignUpMode && !isResetMode && (
              <div>
                <Label htmlFor="name" className="text-gray-200">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={enteredName}
                  onChange={(event) => setEnteredName(event.target.value)}
                  className={AUTH_INPUT_CLASS}
                  disabled={isButtonLoading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="identifier" className="text-gray-200">
                {identifierLabel}
              </Label>
              <Input
                id="identifier"
                type={identifierInputType}
                placeholder={identifierPlaceholder}
                value={enteredIdentifier}
                onChange={(event) => setEnteredIdentifier(event.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={isButtonLoading}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {!isResetMode && (
              <div>
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  value={enteredPassword}
                  onChange={(event) => setEnteredPassword(event.target.value)}
                  className={AUTH_INPUT_CLASS}
                  disabled={isButtonLoading}
                />
              </div>
            )}

            {/* Username-only signup: lost-password warning */}
            {isUsernameSignUp && !isResetMode && (
              <AlertBox variant="warning">
                <strong>Heads up:</strong> Without an email on file, lost passwords cannot be recovered. Save your password somewhere safe.
              </AlertBox>
            )}

            {/* Error Message */}
            {formValidationError && (
              <AlertBox variant="error">{formValidationError}</AlertBox>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={isButtonLoading}
            >
              {signInButtonContent}
            </Button>
          </form>

          {/* Toggle Sign In / Sign Up / Reset */}
          <div className="text-center mt-4 space-y-2">
            {isResetMode ? (
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setFormValidationError("");
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors block w-full"
              >
                Back to sign in
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setFormValidationError("");
                    setEnteredIdentifier("");
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors block w-full"
                >
                  {isSignUpMode ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
                {!isSignUpMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setFormValidationError("");
                      setEnteredPassword("");
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors block w-full"
                  >
                    Forgot password?
                  </button>
                )}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/5 text-gray-400">or</span>
            </div>
          </div>

          {/* Demo Login Button */}
          <Button
            type="button"
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5 py-6 rounded-xl transition-all"
            disabled={isButtonLoading}
          >
            Try Demo Account
          </Button>

        </div>
      </div>
    </div>
  );
}
