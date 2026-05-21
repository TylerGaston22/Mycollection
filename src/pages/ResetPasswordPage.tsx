/**
 * ResetPasswordPage – shown after a user clicks the password-reset link
 * from their email. Supabase's PASSWORD_RECOVERY auth event signs them
 * in to a recovery session; this page collects the new password and
 * calls supabase.auth.updateUser to persist it.
 */
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { PasswordInput } from "../components/ui/PasswordInput";
import { KeyRound, Sparkles } from "lucide-react";
import { AUTH_INPUT_CLASS, AUTH_CARD_CLASS } from "../auth";

interface ResetPasswordPageProps {
  onChangePassword: (newPassword: string) => Promise<boolean>;
}

export function ResetPasswordPage({ onChangePassword }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formValidationError, setFormValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormValidationError("");

    if (newPassword.length < 6) {
      setFormValidationError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormValidationError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    await onChangePassword(newPassword);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10">
      <div className="w-full max-w-md">
        <div className={AUTH_CARD_CLASS}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-orange-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-gray-300">Choose a new password for your account.</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <KeyRound className="h-6 w-6 text-orange-400" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="new-password" className="text-gray-200">
                New password
              </Label>
              <PasswordInput
                id="new-password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-gray-200">
                Confirm new password
              </Label>
              <PasswordInput
                id="confirm-password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={AUTH_INPUT_CLASS}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            {formValidationError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{formValidationError}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating…</span>
                </div>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
