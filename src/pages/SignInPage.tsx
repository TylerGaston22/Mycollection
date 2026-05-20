/**
 * SignInPage – sign-in / sign-up form with demo account shortcut.
 * Supports real Supabase auth (email + password) and a one-click
 * demo login that bypasses authentication entirely.
 */
import { useState } from "react";
import { DEMO_CREDENTIALS } from "../demo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sparkles, Film, Tv, UtensilsCrossed, MapPin, ArrowLeft } from "lucide-react";

interface SignInPageProps {
  onSignIn: (email: string, password: string) => void;
  onSignUp?: (email: string, password: string, name: string) => void;
  onBack: () => void;
  // True while App.tsx is still hydrating the user's data after a
  // successful Supabase sign-in. Keeps the button spinner visible so
  // the user doesn't see a flash of the demo collection.
  externalLoading?: boolean;
}

export function SignInPage({ onSignIn, onSignUp, onBack, externalLoading = false }: SignInPageProps) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [enteredName, setEnteredName] = useState("");
  const [formValidationError, setFormValidationError] = useState("");
  const [isSignInRequestLoading, setIsSignInRequestLoading] = useState(false);
  const isButtonLoading = isSignInRequestLoading || externalLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormValidationError("");

    if (!enteredEmail.trim()) {
      setFormValidationError("Please enter your email");
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

    setIsSignInRequestLoading(true);

    if (isSignUpMode && onSignUp) {
      await onSignUp(enteredEmail, enteredPassword, enteredName);
    } else {
      await onSignIn(enteredEmail, enteredPassword);
    }

    setIsSignInRequestLoading(false);
  };

  const handleDemoLogin = () => {
    onSignIn(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password);
  };

  let signInButtonContent;
  if (isButtonLoading) {
    signInButtonContent = (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span>{isSignUpMode ? "Creating account..." : "Signing in..."}</span>
      </div>
    );
  } else {
    signInButtonContent = isSignUpMode ? "Create Account" : "Sign In";
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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                {isSignUpMode ? "Create Account" : "Welcome Back"}
              </h1>
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-gray-300">
              {isSignUpMode ? "Sign up to start building your collection" : "Sign in to access your collection"}
            </p>
          </div>

          {/* Decorative Icons */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Film className="h-5 w-5 text-orange-400" />
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Tv className="h-5 w-5 text-purple-400" />
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-blue-400" />
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MapPin className="h-5 w-5 text-green-400" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUpMode && (
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
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                  disabled={isButtonLoading}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={enteredEmail}
                onChange={(event) => setEnteredEmail(event.target.value)}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                disabled={isButtonLoading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={enteredPassword}
                onChange={(event) => setEnteredPassword(event.target.value)}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                disabled={isButtonLoading}
              />
            </div>

            {/* Error Message */}
            {formValidationError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{formValidationError}</p>
              </div>
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

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setFormValidationError("");
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUpMode ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
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
