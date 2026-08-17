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

### T. ~~Add tsconfig.json + `npm run typecheck` script~~ ✅ Done 2026-06-15
Added strict tsconfig.json covering `src/**/*.{ts,tsx}` + vite.config.ts.
Added `"typecheck": "tsc --noEmit"` to package.json scripts. First run
surfaced 4 errors, all fixed:

1. `App.tsx:150` — `backgroundColors[contentType]` could resolve to
   `Record<string, boolean>` (the visibleCategories slot) when indexed
   with a runtime `string`. Extracted `getCategoryThemeId(bg, ct)` in
   usePreferences.ts to do the narrowing once.
2. `ListView.tsx:110` — bogus `(col: { accessorKey?: string })`
   annotation didn't match the `@tanstack/react-table` ColumnDef
   union. Replaced with an `'accessorKey' in col` narrowing.
3+4. `StatusBadge.tsx:10`, `StatusToggleMenuContent.tsx:9` — both
   imported from `'../constants'` which resolves to
   `src/components/constants.ts` (non-existent). Worked at runtime
   only because `import type` gets erased; the type came back as
   `any` so there was no type safety. Fixed to `'../../constants'`.

Wired into a `pre-push` git hook via husky (added 2026-06-15): every
`git push` now runs `npm run typecheck && npm test` before any commit
leaves the machine. Total hook time ~14s (12s typecheck, 2s tests).
Use `git push --no-verify` to skip in emergencies only.

When CI exists later, run the same two scripts there as a second
safety net.

### S. ~~Seed demo Gaming category with sample items~~ ✅ Done 2026-06-15
Added `src/demo/games.ts` with 30 mixed-platform, mixed-genre,
mixed-status entries (a few favourites). Wired into `mockItems` via
`src/demo/index.ts` so Try Demo now lands with a populated Gaming
tab matching the shape of Movies/TV/Restaurants/Places.

### U. Surface "Supabase is not configured" instead of failing silently
On 2026-08-17 a rebuilt Codespace had no `.env` (gitignored, so it doesn't
survive a rebuild). Every Supabase write failed, `handleSupabaseError`
swallowed it, `addCustomTab` returned `null`, and App.tsx correctly
declined to switch to a category that was never created. Net effect: "Add
Category" looked like a deleted feature. Cost a session of reading
perfectly good code. Full writeup in `docs/errors.md`.

The J fix (don't fabricate a `temp-…` tab on failure) is right and should
stay. The gap is that the user gets no signal distinguishing "the server
rejected this" from "nothing happened".

Two layers, either or both:
- (a) **Startup check.** `src/lib/supabase.ts` already knows when
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing — it falls
  back to `''`. Surface that once, loudly (a persistent banner, not a
  toast) rather than letting it degrade quietly. Cheapest fix, catches
  the whole class at once.
- (b) **Per-action feedback.** Toast on the `null` return path in
  `addCustomTab` so a failed create says so. Narrower, but also covers
  real RLS/network failures on a properly configured install.

Prefer (a) first — it's a handful of lines and would have made this
self-diagnosing.

### R. Per-custom-category column / field configuration
Custom tabs created via "Add Category" inherit the FALLBACK_REGISTRY_ENTRY behaviour from `contentHelpers.ts` — title, year, posterUrl, notes, status, favourite. No Genre / Studio / Platform UI surfaces for them (they default to `isMedia: false`). That's a sensible default, but users have no way to opt in if their custom category SHOULD have those fields (e.g. a "Board Games" custom tab probably wants Platform = "Player count" or similar).

Two paths to decide between:
- (a) Custom tabs always inherit the default field set. Simpler. Users who want richer fields use one of the built-ins.
- (b) Add a column / field picker to the Add Category dialog (toggle which fields apply). Requires a `custom_tabs.fields jsonb` column + UI for the picker. Also means `getContentTypeFieldConfig` needs a per-tab override path. Bigger surface change.

Pick when motivated by a real user need.

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

### J. ~~Add Category button is broken~~ ✅ Done 2026-06-06
Root cause: `useCustomTabs.addCustomTab` returned a **fake fallback CustomTab** with a `temp-…` id whenever the Supabase insert errored. App.tsx then blindly did `setContentType(newTab.id)` — switching to a phantom category that didn't actually exist in `customTabs`. RLS / schema were fine; the bug was in the return-value contract (and the dialog's fire-and-forget close before the async insert finished, same pattern as O).

Fix:
- `addCustomTab` now returns `Promise<CustomTab | null>`. null on failure, real CustomTab on success.
- `App.handleAddCustomTab` checks the result and only sets contentType on a real success; also returns boolean so the dialog can keep itself open on failure.
- `AddTabDialog.handleSubmit` is now async, awaits onAdd, and only resets + closes on success. Adds an `isSaving` state + "Creating…" button label during the await.
- Sidebar's "Add Category" button is un-hidden (was gated behind `{false && …}` in the interim).

Per-category-column config (the other half of the original J writeup — letting users pick which fields apply to their custom category) is moved to its own todo **R**.

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

### P. ~~Refactor contentHelpers.ts to a per-type registry~~ ✅ Done 2026-06-06
Single `CONTENT_TYPE_REGISTRY` object now owns every per-type trait — categoryLabel, displayLabel, name (singular/plural), watched/wantToSee labels, all the field labels + placeholders, plus the `isMedia` / `usesTmdb` capability flags. Helpers (`isMediaContentType`, `getWatchedLabel`, `getContentTypeFieldConfig`, `getContentTypeName`, `getCategoryDisplayName`, etc.) are now thin lookups into that registry. Custom tabs / unknown content types fall through to a single `FALLBACK_REGISTRY_ENTRY`. Adding the next built-in content type is one new entry instead of seven if/else additions across the file. Exported function signatures unchanged — no call-site updates needed.

### M. ~~Per-user toggle: show/hide categories in Settings~~ ✅ Done 2026-06-06
- Storage: `visibleCategories: Record<string, boolean>` sibling key in `preferences.background_colors` JSONB (no schema change), defaults all-true. Shallow merge on load preserves saved entries when new categories are added later.
- New shared module `src/utils/builtInCategories.ts` (`BUILT_IN_CATEGORIES` array with `id` / `label` / `shortLabel` / `icon`) replaces the duplicated inline arrays in Sidebar + MobileBottomNav.
- Sidebar + MobileBottomNav filter the shared list by the visibility map (missing entries treated as visible).
- SettingsDialog → Appearance tab gains a "Visible Categories" section with one Checkbox per built-in category.
- App.tsx auto-falls-back to the first visible category if the user hides the one they're currently viewing.
- Bonus fix: restored the missing `<TabsList>` in SettingsDialog so the Appearance tab is actually reachable (it had been hidden — only Account ever rendered).
- usePreferences now exports `BackgroundColorsState` so SettingsDialog uses the same typed shape rather than redeclaring a narrower one.

### Q. ~~Settings: let users change their username~~ ✅ Done 2026-06-06
- Settings → Account now has a Username field directly under Display Name. Live-lowercases / strips whitespace as the user types. Save button enables on dirty.
- `useAuth.handleUpdateProfile` extended to accept `{ username? }`. Runs the existing `validateUsername` (length / character / reserved-word checks). Surfaces duplicate-username collisions from the existing `profiles_username_lower_unique` index with a friendly "Username already taken" toast (matched via the duplicate-regex used elsewhere).
- Synthetic-email (username-only) accounts are blocked from renaming with a clear "add a real email first" message — their sign-in path resolves the synthetic email from the stored username, so renaming would break sign-in. Demo accounts also blocked with their own message.

### O. ~~Enter key in Add Item dialog closes without adding~~ ✅ Done 2026-06-06
Root cause was the fire-and-forget pattern in `useItemForm.handleSubmit` — it called `onAdd?.(…)` without awaiting, then immediately called `onSubmitted()` (which closes the dialog). Any failure path inside `addItem` (duplicate-title bail, Supabase error) ran AFTER the dialog had already closed, so the user saw "dialog closes, nothing happens" — the toast was technically there but easy to miss.

Fix: `addItem` and `updateItem` in `useItems` now return `Promise<boolean>` (true on success, false on duplicate / Supabase error). `useItemForm.handleSubmit` became `async` and awaits the result, only calling `onSubmitted()` when the mutation succeeded. On false, the dialog stays open so the user sees the toast and can correct the input.


### N. ~~Faster / mobile-friendly notes editing~~ ✅ Done 2026-06-06
Long-press on any list row (touch-and-hold ~500ms) opens the QuickEditDialog focused on Notes, bypassing the item-detail dialog.
- Desktop: works on ListView TableRow (mouse hold also fires it).
- Mobile: works on MobileListItem in the dedicated phone layout. MobileMainContent mounts its own QuickEditDialog instance for the notes-only flow.
- Hook extracted: `src/hooks/useLongPress.ts` — pointer-event timing (`pointerdown` → 500ms timer; `pointermove` cancels on >10px drag; `pointerup`/`cancel`/`leave` clear; `consumeFiredFlag` lets the follow-up click suppress itself). Both ListView and MobileListItem consume the hook.

Deferred (not done this pass):
- Auto-save on blur (desktop) so user doesn't have to click Save.
- "Edit notes" pencil icon in the item-detail dialog.
- Bigger textarea on mobile.

### E. ~~Upload / change user profile picture~~ ✅ Done 2026-06-06 (needs SQL)
Code shipped:
- `src/utils/uploadAvatar.ts` — pure helper: `validateAvatarFile` (PNG/JPG/WebP/GIF, ≤ 2 MB) + `uploadAvatar(userId, file)` writes to the Supabase `avatars` bucket at `<userId>/<ts>.<ext>` and returns the public URL. No React / no toasts — the dialog handles those.
- ProfileDialog gains an "Upload photo" button (and a trash button to clear). Hidden for demo users / when no `onUpdateProfile` callback is wired (defense in depth — bucket RLS would block them anyway).
- `useAuth.handleUpdateProfile` extended to accept `profileImage?: string | null` (null clears). Persists to `profiles.profile_image` (column already existed in schema.sql).
- Sidebar avatar button now renders the uploaded `<img>` when `currentUser.profileImage` is set, falling back to the User-icon-on-accent-gradient when not.
- `index.html` CSP `img-src` extended with `https://*.supabase.co` so uploaded avatar URLs actually load.

**Needs SQL run by user** before this works end-to-end: `supabase/avatars_storage.sql` creates the public `avatars` bucket + RLS policies (only the owning user can write to `<their-uid>/…`).

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

### 7. ~~Mobile view completion (major gaps closed)~~ ✅ Done 2026-06-06
Two big mobile gaps closed this session:

1. **No access to Friends / Settings / Logout / theme toggles.** The desktop sidebar has a gear icon that opens a dropdown with Light/Dark, Coffee, Friends, Settings, Log Out. Mobile had none of these — only Add Item, the category title, and a profile avatar that opened the profile dialog. Fix: extracted the gear-menu content into a new `<UserMenu>` component (`src/components/navigation/UserMenu.tsx`); both Sidebar and MobileHeader use it. Tapping the mobile avatar now opens the same set of actions, plus a Profile item at the top so the original "tap avatar → profile" path is preserved.

2. **Uploaded profile picture didn't show on mobile.** MobileHeader was hard-coded to show the user's name initial. Now renders the `profileImage` URL when set, falling back to the initial otherwise — matches the sidebar avatar's behaviour.

3. **Long-press to edit notes** also landed during this session (todo N) — mobile MobileListItem now uses the shared `useLongPress` hook to open the notes editor on touch-and-hold.

Out-of-scope follow-ups that could still happen:
- More granular mobile-specific responsive tuning (the desktop sidebar also gracefully shrinks at narrow widths via the .sidebar-fluid CSS, so phones now have two valid paths: dedicated mobile chrome OR shrunken sidebar). Verify on a real phone.
- Mobile-specific recommendation send flow (probably fine via item detail → Recommend button, since RecommendButton is rendered there).
Earlier commit said "working on mobile view" — components exist in `src/components/mobile/` but weren't finished. Tackle when you have mobile users or before publishing.

### 6. ~~Toast/banner on Supabase failures~~ ✅ Done 2026-05-14
`usePreferences.ts` upsert + load and `useAuth.ts` profile load now toast on real failures instead of silently `console.error`-ing. PGRST116 (no rows) is still treated as expected (new users with no preferences row, or sign-up trigger hasn't fired yet) and falls through to defaults silently.

### 8. ~~Add tests for `utils/csv.ts`~~ ✅ Done 2026-06-06
Installed vitest (`npm i -D vitest @vitest/ui`) and added test scripts (`test`, `test:watch`, `test:ui`) to package.json. New `vitest.config.ts` keeps the test config separate from the build config; tests run in Node env (no JSDOM needed yet — utils only). First test file `src/utils/csv.test.ts` covers `parseCsvLine` (quoted fields, embedded commas, escaped quotes, empty fields), `parseCsvIntoItems` (error cases + happy path + HTML-strip + sanitize-image + round-trip with serializer), and `serializeItemsToCsv` (header row, quoting, escape rules, empty array). 28 tests, all pass.

Leftover infra debt: `npm audit` shows 2 high-severity warnings on vitest's transitive deps (esbuild's NPM_CONFIG_REGISTRY thing — dev-server only, not runtime). Resolving them needs `npm audit fix --force` which would bump vite from 6 to 8 (a major). Defer until we tackle a deliberate Vite-version bump.

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

### 14. ~~Expand the CSP `img-src` whitelist~~ ✅ Done 2026-06-06 (incremental)
Two extensions shipped as new image sources were added:
- TMDB posters: `https://image.tmdb.org` (from the original baseline).
- Supabase Storage avatars: `https://*.supabase.co` (added during todo E so uploaded profile pictures actually load).
- `data:` inline URIs kept for the small inline error-placeholder SVG.
Re-extend this list as new image hosts are added — silently failing images are the symptom of a missing CSP entry.

---

## 🌱 New feature ideas (longer-term)

Detailed write-ups for all three are in [ideas.md](./ideas.md) under "Features":

- **Username-only signup** (no email required) — synthetic-email auth pattern. Schema sketch + recovery-code tradeoffs already documented. Mid-effort (a few hours), single-session feasible.
- **Friend system (view-only list sharing)** — friend requests, view friends' lists read-only. Multi-day feature.
- **Shared / collaborative lists** — multiple users editing the same list together. Depends on the friend system being built first. Multi-day feature.

All three require Supabase schema additions. Don't start without a clear plan — open ideas.md before kicking off.

---

_Last touched: 2026-05-14 (post smoke-test)_
