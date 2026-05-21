/**
 * SettingsDialog – app settings with two tabs: Appearance and Account.
 * Appearance tab: per-category colour theme pickers via ColorPicker.
 * Account tab: CSV/TXT export and import, with a link to the
 * FormatGuideDialog for import formatting help.
 */

import { useEffect, useState } from 'react';
import { Lock, Palette, Info, ImageIcon, Film, Tv, UtensilsCrossed, MapPin, User as UserIcon, Mail, KeyRound, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PasswordInput } from "../ui/PasswordInput";
import { DataManagementButtons } from "../settings/DataManagementButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Item, CustomTab, CustomSection } from "../../types";
import type { User } from "../../types";
import { ColorPicker } from "../settings/ColorPicker";
import { FormatGuideDialog } from "./FormatGuideDialog";
import { useDataExportImport } from "../../hooks/useDataExportImport";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: Item[];
  customTabs?: CustomTab[];
  customSections?: CustomSection[];
  onImport?: (data: { items: Item[], customTabs: CustomTab[], customSections: CustomSection[] }) => void;
  backgroundColors: {
    item: string;
    'tv-show': string;
    restaurant: string;
    place: string;
  };
  onBackgroundColorsChange: (colors: { item: string; 'tv-show': string; restaurant: string; place: string }) => void;
  currentUser: User;
  isDemoUser: boolean;
  onUpdateProfile: (updates: { name?: string; listVisibility?: 'private' | 'friends' }) => Promise<boolean>;
  onUpdateEmail: (newEmail: string) => Promise<boolean>;
  onChangePassword: (newPassword: string, currentPassword?: string) => Promise<boolean>;
}

export function SettingsDialog({ open, onOpenChange, items, customTabs, customSections, onImport, backgroundColors, onBackgroundColorsChange, currentUser, isDemoUser, onUpdateProfile, onUpdateEmail, onChangePassword }: SettingsDialogProps) {
  const [isFormatGuideDialogOpen, setIsFormatGuideDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const { bulkImportCsv, exportCsv } = useDataExportImport();

  // Username-only accounts have empty email (synthetic addresses are stripped
  // out in loadProfile). Hide the email-change UI for those users.
  const hasRealEmail = currentUser.email.trim().length > 0;
  // Demo users have no Supabase Auth row — password changes wouldn't work.
  const canChangePassword = !isDemoUser;

  // Reset fields whenever the dialog opens or the current user changes,
  // so reopening doesn't show stale input from a previous edit attempt.
  useEffect(() => {
    if (open) {
      setDisplayName(currentUser.name);
      setNewEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
  }, [open, currentUser.name]);

  const isNameDirty = displayName.trim() !== currentUser.name && displayName.trim().length > 0;
  const isEmailDirty =
    newEmail.trim().length > 0 && newEmail.trim().toLowerCase() !== currentUser.email.toLowerCase();
  const canSavePassword =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  const handleSaveName = async () => {
    setIsSavingName(true);
    await onUpdateProfile({ name: displayName });
    setIsSavingName(false);
  };

  const handleSaveEmail = async () => {
    setIsSavingEmail(true);
    const ok = await onUpdateEmail(newEmail);
    setIsSavingEmail(false);
    if (ok) setNewEmail(''); // Clear the input on success — old email shown above stays until confirmed
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    setIsSavingPassword(true);
    const ok = await onChangePassword(newPassword, currentPassword);
    setIsSavingPassword(false);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const updateColor = (type: 'item' | 'tv-show' | 'restaurant' | 'place', colorId: string) => {
    onBackgroundColorsChange({ ...backgroundColors, [type]: colorId });
  };

  const handleExportCsv = () => {
    exportCsv(items || []);
  };

  const handleImportCsv = () => {
    if (!onImport) return;
    bulkImportCsv(
      items || [],
      onImport,
      customTabs || [],
      customSections || [],
      () => onOpenChange(false),
    );
  };

  const totalMoviesCount = items?.length ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your app experience</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="account" className="w-full">
            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Tab Backgrounds
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">Customize the background for each section</p>
                </div>
                <ColorPicker label="Movies Background" icon={Film} type="item" selectedColor={backgroundColors.item} onColorChange={updateColor} />
                <ColorPicker label="TV Shows Background" icon={Tv} type="tv-show" selectedColor={backgroundColors['tv-show']} onColorChange={updateColor} />
                <ColorPicker label="Restaurants Background" icon={UtensilsCrossed} type="restaurant" selectedColor={backgroundColors.restaurant} onColorChange={updateColor} />
                <ColorPicker label="Places Background" icon={MapPin} type="place" selectedColor={backgroundColors.place} onColorChange={updateColor} />
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="settings-display-name">Display name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="settings-display-name"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Your name"
                        disabled={isSavingName}
                        maxLength={80}
                      />
                      <Button
                        type="button"
                        onClick={handleSaveName}
                        disabled={!isNameDirty || isSavingName}
                      >
                        {isSavingName ? 'Saving…' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>

                {!isDemoUser && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      List visibility
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.listVisibility === 'friends'
                        ? 'Your friends can see your collection (read-only).'
                        : 'Your collection is private — only you can see it.'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdateProfile({
                          listVisibility:
                            currentUser.listVisibility === 'friends' ? 'private' : 'friends',
                        })
                      }
                    >
                      {currentUser.listVisibility === 'friends'
                        ? 'Make private'
                        : 'Share with friends'}
                    </Button>
                  </div>
                )}

                {!isDemoUser && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </h4>
                    {hasRealEmail ? (
                      <p className="text-sm text-muted-foreground">
                        Current: <span className="font-mono">{currentUser.email}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No email on file — your account is username-only. Add an email to enable password recovery.
                      </p>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="settings-new-email">
                        {hasRealEmail ? 'Change email' : 'Add email'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="settings-new-email"
                          type="email"
                          value={newEmail}
                          onChange={(event) => setNewEmail(event.target.value)}
                          placeholder="your-address@example.com"
                          disabled={isSavingEmail}
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          onClick={handleSaveEmail}
                          disabled={!isEmailDirty || isSavingEmail}
                        >
                          {isSavingEmail ? 'Sending…' : 'Save'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We'll send a confirmation link to the new address. The change only takes effect after you click it.
                        {!hasRealEmail && ' Once confirmed, you\'ll sign in with this email instead of your username.'}
                      </p>
                    </div>
                  </div>
                )}

                {canChangePassword && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Password
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="settings-current-password">Current password</Label>
                      <PasswordInput
                        id="settings-current-password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="Your existing password"
                        disabled={isSavingPassword}
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-new-password">New password</Label>
                      <PasswordInput
                        id="settings-new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="At least 6 characters"
                        disabled={isSavingPassword}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-confirm-password">Confirm new password</Label>
                      <div className="flex gap-2">
                        <PasswordInput
                          id="settings-confirm-password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter password"
                          disabled={isSavingPassword}
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          onClick={handleSavePassword}
                          disabled={!canSavePassword || isSavingPassword}
                        >
                          {isSavingPassword ? 'Saving…' : 'Save'}
                        </Button>
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-destructive">{passwordError}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <h4>Data Management</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your collection as CSV or import from a CSV/TXT file.
                  </p>
                  <DataManagementButtons onExport={handleExportCsv} onImport={handleImportCsv} />
                  <p className="text-xs text-muted-foreground">
                    {totalMoviesCount} items in your collection.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsFormatGuideDialogOpen(true)}>
                      <Info className="h-4 w-4 mr-1" />
                      Import Format Guide
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <FormatGuideDialog open={isFormatGuideDialogOpen} onOpenChange={setIsFormatGuideDialogOpen} />
    </>
  );
}
