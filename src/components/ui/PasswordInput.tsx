/**
 * PasswordInput – an Input that hides/shows its value via a built-in
 * eye toggle. Always-on (not a browser-native reveal that may or may
 * not appear), white-colored icon so it's visible on dark sign-in /
 * reset-password backgrounds.
 *
 * Also hides the browser's native reveal button (Edge / Chromium-on-
 * Windows render their own eye icon on password fields by default;
 * keeping both would look duplicated and inconsistent).
 */

import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { cn } from "./utils";
import { useToggle } from "../../hooks/useToggle";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...inputProps }, ref) => {
    const visible = useToggle();

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible.value ? "text" : "password"}
          // pr-10 leaves room for the icon; the [&::-ms-reveal] selector
          // disables the Edge/IE native reveal button.
          className={cn("pr-10 [&::-ms-reveal]:hidden", className)}
          disabled={disabled}
          {...inputProps}
        />
        <button
          type="button"
          onClick={visible.toggle}
          aria-label={visible.value ? "Hide password" : "Show password"}
          title={visible.value ? "Hide password" : "Show password"}
          tabIndex={-1}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed p-1"
        >
          {visible.value ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
