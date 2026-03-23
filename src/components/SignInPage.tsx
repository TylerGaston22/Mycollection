import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sparkles, Film, Tv, UtensilsCrossed, MapPin, ArrowLeft } from "lucide-react";

interface SignInPageProps {
  onSignIn: (username: string, password: string) => void;
  onBack: () => void;
}

export function SignInPage({ onSignIn, onBack }: SignInPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!username.trim()) {
      setError("Please enter your username or email");
      return;
    }
    
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      onSignIn(username, password);
      setIsLoading(false);
    }, 800);
  };

  const handleDemoLogin = () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL as string;
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD as string;
    setUsername(demoEmail);
    setPassword(demoPassword);
    setError("");

    setIsLoading(true);
    setTimeout(() => {
      onSignIn(demoEmail, demoPassword);
      setIsLoading(false);
    }, 800);
  };

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
                Welcome Back
              </h1>
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-gray-300">
              Sign in to access your collection
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

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-gray-200">
                Username or Email
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                disabled={isLoading}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

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
            className="w-full border-white/10 text-black hover:bg-white/5 hover:text-white py-6 rounded-xl transition-all"
            disabled={isLoading}
          >
            Try Demo Account
          </Button>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              Forgot password?
            </button>
            <div className="text-sm text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-orange-400 hover:text-orange-300 transition-colors font-semibold"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}