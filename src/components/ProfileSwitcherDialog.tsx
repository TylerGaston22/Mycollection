/**
 * ProfileSwitcherDialog – modal for switching between user profiles.
 * Lists all non-guest users with avatar badges, highlights the
 * currently active profile, and triggers a switch on selection.
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { User, Check } from 'lucide-react';
import { User as UserType } from "../types";
import { ThemeConfig, colorToRgba } from "../utils/themeConfig";

interface ProfileSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserType[];
  currentUserId: string;
  onSwitchProfile: (userId: string) => void;
  currentTheme?: ThemeConfig;
}

export function ProfileSwitcherDialog({
  open,
  onOpenChange,
  users,
  currentUserId,
  onSwitchProfile,
  currentTheme
}: ProfileSwitcherDialogProps) {
  const handleSwitch = (userId: string) => {
    onSwitchProfile(userId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Switch Profile</DialogTitle>
          <DialogDescription>
            Choose which profile you want to use
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {users.filter((user) => user.id !== 'user-guest').map((user) => {
            const isCurrentUser = user.id === currentUserId;
            let userButtonClassName = 'w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-muted/50 ';
            let userButtonStyle: React.CSSProperties = {};
            if (isCurrentUser && currentTheme) {
              userButtonClassName += 'bg-muted/30';
              userButtonStyle = { borderColor: colorToRgba(currentTheme.accentColor, 0.5) };
            } else if (isCurrentUser) {
              userButtonClassName += 'border-primary bg-muted/30';
            } else {
              userButtonClassName += 'border-border';
            }
            return (
              <button
                key={user.id}
                onClick={() => handleSwitch(user.id)}
                className={userButtonClassName}
                style={userButtonStyle}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback
                    className="text-primary-foreground"
                    style={currentTheme ? {
                      background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${colorToRgba(currentTheme.accentColor, 0.8)})`,
                    } : undefined}
                  >
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4>{user.name}</h4>
                    {isCurrentUser && (
                      <Check className="h-4 w-4" style={currentTheme ? { color: currentTheme.accentColor } : undefined} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
