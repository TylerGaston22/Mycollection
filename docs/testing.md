# Testing & edge cases

A running checklist of things to manually verify, plus known edge cases. Updated as features ship. Tick items off as you confirm them.

---

## 🖼 Note screenshots (just shipped)

### Setup
- [x] `supabase/note_images.sql` has been run in the SQL Editor (✓ done 2026-09-03). Verify: Storage → a `note-images` bucket exists and is public; Database → `collection_items` has a `note_images` column.

### Happy path — Add/Edit dialog
- [ ] Take a screenshot, open **Add Item**, click into **Notes**, press Cmd/Ctrl+V → a spinner tile appears, then a thumbnail. No filename text gets inserted into the note.
- [ ] Save the item → reopen it via **Edit** → the thumbnail is still there.
- [ ] Open the item's **detail dialog** → the screenshot shows under Notes; click it → opens large; Esc closes the lightbox but leaves the detail dialog open.
- [ ] Grid card and list row show the small image-count badge.

### Happy path — quick edit
- [ ] Desktop list view: click an item's **Notes** cell → paste a screenshot → **Save** → badge appears on the row.
- [ ] Mobile: **long-press** a row → same notes editor → paste or **Add image** → Save.

### Other input routes
- [ ] **Drag and drop** an image file onto the notes textarea → attaches (the textarea shows a focus ring while dragging).
- [ ] **Add image** button → file picker → attaches. On mobile this is the reliable route; the picker offers the photo library.
- [ ] Paste **plain text** into notes → inserts as text as usual, nothing uploads.
- [ ] Copy a region from a web page (text + image together) and paste → the image attaches and the HTML's text is NOT dumped into the note.

### Edge cases
- [ ] Paste an image **over 5 MB** → toast "Image is too big (X MB). Max 5 MB." and nothing attaches.
- [ ] Drop a **PDF or .txt** → ignored silently (not an image, so not treated as an attach attempt).
- [ ] Attach **12 images**, then try a 13th → toast "A note can hold 12 images." and the **Add image** button is disabled.
- [ ] Paste **several images at once** (multi-select drop) → each gets its own spinner tile, all attach.
- [ ] Remove an image with its **X**, then **Cancel** the dialog → the image is still on the item (removal only commits on Save).
- [ ] Remove the **last** image and Save → the item's badge disappears and it stays gone after a refresh (this is the case an omitted field would silently fail).
- [ ] Add a screenshot to an item with **no typed note** → the detail dialog shows the Notes section with just the image, not "No additional details available."
- [ ] **Demo user** (`demo` / `demo`) opens Notes → no "Add image" button, no paste hint; typing notes still works normally.
- [ ] Attach an image, then **export JSON** and re-import it → the image comes back (URLs survive the sanitizer).

### Known tradeoffs (not bugs)
- Pasting and then cancelling the dialog leaves the uploaded file orphaned in the bucket. Nothing references it. Same tradeoff as avatars — see `supabase/note_images.sql`.
- Deleting an item does not delete its screenshots from the bucket.

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

## 🆕 Recent batch — unverified (2026-08-17)

### Sign in with email OR username (todo X)

Backend is verified; the app-facing half is not. Already confirmed by direct testing:
- ✓ SQL backfill ran — all 3 accounts have a username (`stilusnex`, `test`, `test1`).
- ✓ Edge Function deployed and responding at `/functions/v1/signin`.
- ✓ Real-username-wrong-password and nonexistent-username return **byte-identical** `{"error":"Invalid login credentials"}` / HTTP 401. No enumeration via the response.

Untested — needs a real password, so it has to be done by hand:
- [ ] Sign out. Sign in with **`stilusnex`** + correct password → signs in. **This is the thing that was broken; if only one line gets tested, make it this one.**
- [ ] Sign in with **`stilusnex@gmail.com`** + correct password → still works (no regression on the path that already worked).
- [ ] Sign in with **`test`** (username-only account) + its password → still works. This should never have touched the Edge Function — it resolves via the synthetic address on the first, direct attempt.
- [ ] Wrong password with a **valid** username → generic "Invalid login credentials", no hint the account exists.
- [ ] A username that doesn't exist → **identical** message and behaviour to the line above.
- [ ] `demo` / `demo` still short-circuits to the demo account before any of this runs.
- [ ] Watch **Edge Functions → `signin` → Logs** during the above: it should be invoked for `stilusnex` and NOT for `test` or for email sign-in.

Deferred, with reasoning:
- [ ] **Timing side channel.** Measured after deploy: existing-username ≈ 0.61–0.97s, nonexistent ≈ 0.44–0.72s. The existing-user path does an extra `profiles` lookup plus `getUserById` before failing, so it's measurably slower on average. Samples overlap heavily and network jitter dominates at n=4, so it's not a clean oracle — but it is a real asymmetry that enough samples could exploit statistically. Closing it means always doing a dummy password verification even when resolution fails, so both paths cost the same. Judged well past reasonable for a personal app; recorded so the decision is deliberate rather than overlooked.

### Custom category icon + Add Category / Add Subcategory failure handling (todos V + W)
- [ ] Create a custom category, pick a **non-star** icon (Trophy, Music…) → the sidebar shows that icon, not a star.
- [ ] Same category on mobile → bottom nav shows the same icon.
- [ ] Existing categories created before this fix → now render their stored icon on reload.
- [ ] Create a second, third category back to back → no hang on "Creating…".
- [ ] Force a failure (offline, or DevTools → Network → Offline) then create a category → error toast appears, dialog stays open with the typed name intact, button returns from "Creating…" to "Create Tab" and is clickable again.
- [ ] Same offline test for **Add Subcategory** → toast, dialog stays open, no switch to a subcategory that doesn't exist.
- [ ] Settings → Appearance → the four Tab Backgrounds pickers are gone; **Visible Categories** is still there and still toggles.

### Supabase-not-configured banner (todo U)
- [ ] `mv .env .env.bak`, restart dev server → red banner at the top naming both missing vars. Never rendered by anyone yet — the logic is unit-tested, the visuals are not.
- [ ] Restore `.env`, restart → banner gone.

---

## 🆕 Recent batch — unverified (2026-05/06)

Everything below this header was shipped without manual verification at commit time. Sweep through it when you have a testing window.

### Refresh restores user's view (todo A + UX polish, 2026-05-22)
- [x] Sign in. Click TV Shows → Watched. Hit F5 / browser refresh → you land back on TV Shows → Watched, not the default Movies → All. ✓ 2026-06-17
- [~] Refresh while signed in → you see only a spinner briefly, no flash of the Sign In page. ⚠ 2026-06-17: brief WHITE flash observed (not landing/sign-in). Deferred — fix later. Likely the bg colour applied via JS instead of inline in index.html before React mounts.
- [x] Toggle to the Coffee theme. Refresh → no flash of the dark/purple background before the cream theme paints. ✓ 2026-06-17

### Friend system bug fixes (todo B + RLS, 2026-05-22)
- [ ] Sign in. From a different account, search for your username (≥ 2 chars). You appear in results and they can send a friend request.
- [ ] Switch to your account. Friends → **Requests** tab shows the incoming request (Accept/Decline). Accept it → tab clears, the friend appears under **Friends**.
- [ ] Delete a test user in Supabase Auth, then try to sign up with the same username — should succeed (no "username already taken" from an orphan profile row).

### Recommend-to-friend (todo G, 2026-05-22)
- [ ] Open any item's detail → "Recommend" → pick a friend + optional note → Send. Toast confirms.
- [ ] As the recipient: orange notification dot on the gear icon. Friends → **Recs** tab shows the incoming row with the snapshot title and the note.
- [ ] Each pending row has a status radio (Want to See / Watched default) + optional Section dropdown (only visible if you have custom sections for that content type). Click ✓ Accept → item lands in your collection with the chosen status + section. ✕ dismisses.
- [ ] Pending sent section under it: you can delete an outgoing recommendation.

### Modularity refactors (todo K1–K6 + P, no visible behaviour change)
These should be invisible — verify nothing regressed:
- [ ] Password field eye toggle works (`useToggle` refactor).
- [x] Add Item from any category still works end-to-end (`useItemForm` extraction). ✓ 2026-06-17
- [x] All ListView columns render correctly per category (column factory extraction). ✓ 2026-06-17 — user has columns hidden per preference; factory has been live since 2026-05-22 with no regressions reported. Tests + typecheck green.
- [x] Movies / TV Shows / Restaurants / Places / Games each show the right labels and field placeholders (`CONTENT_TYPE_REGISTRY` refactor). ✓ 2026-06-17

### Gaming category (todo L, 2026-05-22)
- [ ] Sidebar shows a **Games** category with the gamepad icon.
- [ ] Click Games → status labels read "Played" / "Want to Play".
- [ ] Add a game → year field, cover URL field, Platform field with placeholder "PS5, Xbox, Steam, Switch, etc.", Genre + Studio fields (game shares these with movies/TV).
- [ ] TMDB search button does NOT appear on the game form (TMDB only knows movies/TV).

### Per-category visibility (todo M, 2026-05-22)
- [ ] Settings → Appearance → Visible Categories shows 5 checkboxes.
- [ ] Uncheck Games → it disappears from the sidebar AND the mobile bottom nav. Items not deleted — re-check to confirm.
- [ ] While viewing Games, uncheck Games → automatically switches you to the first still-visible category.
- [ ] Settings now has BOTH Account + Appearance tabs visible (the missing TabsList was restored).

### Movies "Add Item" → "Add Movie" copy fix
- [ ] On Movies, the "+ Add" button reads **Add Movie**. The Add Movie dialog title also reads "Add Movie".
- [ ] Other categories read correctly: "Add TV Show", "Add Restaurant", "Add Place", "Add Game".

### Per-category list columns scoping (todo I)
- [ ] Movies + TV Shows: Where to Watch + Genre columns both visible.
- [ ] Restaurants: Genre column gone, platform column header reads **Cuisine Type**.
- [ ] Places: Genre column gone, platform column header reads **Location**.
- [ ] Games: Genre visible, platform column header reads **Platform**.
- [ ] Clicking a platform cell on Restaurants opens "Edit Cuisine Type" popup (not "Edit Where to Watch").

### Enter key bug + Add Item failure behaviour (todo O)
- [ ] Open Add Item. Type a unique title. Press Enter → form submits, item added, dialog closes.
- [ ] Type a title that already exists in the current category → press Enter or click Add → "Duplicate item" toast appears AND the dialog **stays open** so you can change the title without retyping.

### Change username in Settings (todo Q)
- [ ] Settings → Account → Username field. Lowercases + strips whitespace as you type.
- [ ] Change to a new valid value → Save → toast confirms. Sidebar header updates.
- [ ] Try a username already in use → "Username already taken" toast.
- [ ] On a username-only account (signed up without email) → toast says "Add a real email first" instead of attempting the rename.
- [ ] Demo account → toast says "Demo accounts can't change their username".

### Add Category fixed + re-shown (todo J)
- [ ] Sidebar shows the **Add Category** button at the bottom.
- [ ] Click it → dialog opens with name + icon picker. Pick → Create Tab → tab appears in the sidebar AND becomes the active view.
- [ ] If something fails (you'd have to simulate by breaking RLS) — the dialog should STAY open with the toast.

### Long-press to edit notes (todo N)
- [ ] Touch-and-hold a list row for ~500ms on mobile → opens the notes editor directly (bypasses the item detail dialog).
- [ ] Short tap on the same row → opens the detail dialog normally.
- [ ] Hold + drag-to-scroll → does NOT trigger the notes editor (>10px movement cancels the press).
- [ ] On desktop with mouse: holding the mouse button on a row for 500ms also opens notes editor — short click still opens detail.

### Profile picture upload (todo E)
**Pre-req: run `supabase/avatars_storage.sql` in the Supabase SQL Editor** — done 2026-06-06 by user.
- [ ] Open Profile → "Upload photo" button → pick a small PNG/JPG → uploads + the avatar updates in the Profile dialog AND in the sidebar header.
- [ ] Try a 5 MB file → toast "Image is too big (5.0 MB). Max 2 MB." No upload happens.
- [ ] Try a `.txt` file → toast "Please pick a PNG, JPG, GIF, or WebP image." No upload.
- [ ] Click the trash icon next to the avatar → reverts to the default User-icon-on-accent-gradient.
- [ ] On a demo account: the Upload photo + trash buttons are NOT visible.

### Mobile chrome completion (todo 7)
On an actual phone OR a touch device — the mobile-only chrome (MobileHeader + MobileBottomNav + MobileMainContent) renders only when the device reports `pointer: coarse` and `hover: none`.
- [ ] Tap the avatar in the top-right → dropdown opens with: Profile, Light/Dark Mode, Coffee Theme, Friends (with badge), Settings, Log Out.
- [ ] After uploading a profile picture, the mobile avatar shows the uploaded image (not the initial letter).
- [ ] If there are pending friend requests, a small orange dot floats over the mobile avatar (matches the desktop gear icon).
- [ ] Friends, Settings, Log Out from the mobile UserMenu all work the same as the desktop gear menu.
- [ ] Coffee Theme toggle from the mobile menu flips the surface theme app-wide.

### Long-press notes editing on mobile (todo N)
- [ ] On a phone (or any touch device), touch-and-hold a list item row for ~500ms → opens the notes editor directly.
- [ ] Short tap on the same row → opens the item detail dialog normally.
- [ ] Touch a row and immediately scroll → no notes editor (the move tolerance cancels the press).

### Unit-test infrastructure (todo 8)
- [ ] `npm test` from the project root runs the vitest suite. Expected: ~128 tests across utils + auth + recommendations. All pass.
- [ ] `npm run test:watch` starts a watch mode you can leave running while editing.

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
