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
import { User as UserType } from "../types/user";

interface ProfileSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserType[];
  currentUserId: string;
  onSwitchProfile: (userId: string) => void;
}

export function ProfileSwitcherDialog({ 
  open, 
  onOpenChange, 
  users, 
  currentUserId,
  onSwitchProfile 
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
          {users.filter(user => user.id !== 'user-guest').map((user) => (
            <button
              key={user.id}
              onClick={() => handleSwitch(user.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-muted/50 ${
                user.id === currentUserId 
                  ? 'border-primary bg-muted/30' 
                  : 'border-border'
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h4>{user.name}</h4>
                  {user.id === currentUserId && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
