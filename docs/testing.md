# Testing & edge cases

A running checklist of things to manually verify, plus known edge cases. Updated as features ship. Tick items off as you confirm them.

---

## 🧪 Friend system (just shipped)

### Setup
- [ ] `supabase/friendships.sql` has been run in the SQL Editor (✓ done 2026-05-14).
- [ ] You have at least **two real Supabase accounts**. Use the existing email account (Jon Snow) + a fresh sign-up (the previous test user was deleted during password-recovery troubleshooting).

### Happy path — send / accept / view
- [ ] As Account A: gear → **Friends** → **Find** tab → search for Account B's username → click **Add** → toast "Friend request sent".
- [ ] As Account B: gear → Friends → **Requests** tab → see incoming request → click **Accept** → toast "Friend request accepted".
- [ ] As Account B: gear → **Settings** → **List visibility** → click **Share with friends** → toast "Profile updated".
- [ ] As Account A: gear → Friends → **Friends** tab → see Account B listed → click **View list** → see Account B's items read-only.

### Edge cases — friend search
- [ ] Search with **< 2 characters** → no results returned (RPC short-circuits).
- [ ] Search for **your own username** → not in results (RPC excludes `auth.uid()`).
- [ ] Search for a username with **mixed case** ("Jon", "JON", "jon") → still matches (RPC uses `lower()`).
- [ ] Search returns a user **you're already friends with / have pending with** → Add button reads "Pending / friends" and is disabled.

### Edge cases — requests
- [ ] Sending a **second request to the same user** while one is already pending → toast "You already have a pending request or existing friendship with this user." (Triggered by the unique-pair DB constraint; we catch it via the duplicate regex in `useFriends.send`.)
- [ ] **Declining** an incoming request → row disappears from both users' views.
- [ ] **Cancelling an outgoing request** → row disappears from both users' views.
- [ ] Either party clicking **Remove** on an accepted friendship → both sides see the row gone next time they refresh.

### Edge cases — visibility
- [ ] View a friend's list while their visibility is **private** → empty state explains "Either their collection is empty, or they haven't enabled friend visibility for it."
- [ ] Account A toggles visibility to friends, then back to private → Account B's "View list" should immediately return empty (RLS reads visibility live, no caching).

### Edge cases — auth states
- [ ] **Demo user** opens the FriendsDialog → friendly message: "Friends are a real-account feature — sign in (or sign up) to use them." No tabs rendered.

---

## 🔐 Auth flow (verify still working after recent refactors)

### Sign in / sign up
- [ ] Sign-in with email + password works (with new auto-detect — no `@` toggle).
- [ ] Sign-up with email succeeds; profile row auto-created via `handle_new_user`.
- [ ] Sign-up with **username only** (no `@`) → yellow lost-password warning shows.
- [ ] Username-only sign-in (just the username, no email-like domain) works.
- [ ] Sign-up form **rejects malformed emails** (`tyler@`, `tyler@gmail`) inline before hitting Supabase.
- [ ] Sign-up rejects **duplicate username** with friendly message.
- [ ] Sign-up rejects **reserved username** (`demo`, `admin`, `root`, `system`, `support`).

### Forgot / change password
- [ ] **Forgot password** link sends a reset email to email accounts; recovery link works from the same machine running `npm run dev`.
- [ ] **Username-only accounts** get a clear "not available" toast on Forgot password.
- [ ] **Settings → Password** requires current password; wrong current password is rejected with "Current password is incorrect."
- [ ] After a successful password change, sign out + sign in with the **new** password works.

### Account settings
- [ ] **Change display name** updates immediately in the sidebar header.
- [ ] **Change email** sends confirmation to new address; change takes effect after clicking the link.
- [ ] **Add email** is available for username-only accounts; once confirmed, username sign-in stops working (warning shown beforehand).
- [ ] **Demo user** in Settings: no Email, Password, or Visibility sections render.

### UI polish
- [ ] Sign-in / sign-up inputs are **solid white** with **black text**, **black eye toggle**, and **no color shift** when focused or autofilled.
- [ ] Show-password toggle always renders (no disappearing browser-native eye).

---

## ➕ Add Item — auto-default to active view (todo F)
Navigate around the sidebar, then click **Add Item** and confirm the form
matches what you were viewing.

- [ ] **Movies → Watched** → Add Item → status radio is preselected to "Watched", description reads "Adding to: Movies › Watched".
- [ ] **TV Shows → Want to See** → Add Item → status is "Want to See", description reads "Adding to: TV Shows › Want to See".
- [ ] **Restaurants → All** → Add Item → status defaults to "Want to See", description reads "Adding to: Restaurants › All".
- [ ] **Movies → Favorites** → Add Item → status defaults to "Want to See", description reads "Adding to: Movies › Favorites" (favourite flag itself is not auto-set — separate concern).
- [ ] A custom section (e.g. "Date night" under Movies) → Add Item → description reads "Adding to: Movies › Date night" AND that section's checkbox is preselected lower in the form.
- [ ] **Edit** an existing item → preselect logic should NOT fire — status reads from the item itself, no "Adding to:" breadcrumb.
- [ ] Manually change the status radio after the auto-default and save → saved item uses the manually chosen status (auto-default is just an initial value, not a lock).

## 🎲 Dice picker
- [ ] On a category with **0 items**: dice button is disabled (tooltip "Add some [type]s first").
- [ ] On a category with **1 item**: re-roll inside the modal is disabled.
- [ ] **Re-roll never repeats** the just-shown item (verifiable on a 2-item category by hitting re-roll several times).
- [ ] **Open** in the modal closes it and opens the existing item-detail dialog for the picked item.
- [ ] Dice button is **white face / black icon** in both light and dark mode.

---

## 🎨 Theme + dark mode
- [ ] Dark-mode toggle in the gear dropdown flips the palette without reload.
- [ ] Sidebar background shifts to `var(--sidebar)` in dark mode.
- [ ] Ghibli image overlay is hidden in dark mode (visible only in light).
- [ ] FormatGuideDialog's "Pro Tip" box is distinct from the dialog surface in both modes.

---

## 📦 Data import / export
- [ ] **CSV export** downloads a file named `my-collection-YYYY-MM-DD.csv`.
- [ ] **CSV import** rejects rows missing Title/Type, parses quoted commas/quotes correctly, skips unrecognised types silently, and shows a friendly summary toast.
- [ ] **JSON export/import** roundtrip preserves items, custom tabs, custom sections.

---

## 🔒 Security (passive — nothing to actively test, but worth knowing)
- [ ] All mutating Supabase queries include an explicit `eq('user_id', currentUserId)` filter in addition to RLS (defense in depth — already in place across the data hooks).
- [ ] `npm audit` reports **0 vulnerabilities** (last verified 2026-05-14).
- [ ] CSP `img-src` is locked to `'self'`, `https://image.tmdb.org`, and `data:` — any other image source fails silently.

---

## Reporting issues

If anything in this checklist fails, capture:
1. **What you did** — exact clicks / inputs.
2. **What happened** — including any toast text.
3. **Browser console** — F12 → Console tab → any red errors.
4. **Network tab** (for Supabase issues) — status code of the failing request.

Drop those in a chat message and we'll fix.
