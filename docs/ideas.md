# Future Ideas / Deferred Work

A running list of ideas, deferred decisions, and improvements discussed during development. Each item notes **why it's not done yet** and **when it'd be worth revisiting**.

Update this file as new ideas come up. Cross items off (or delete them) when they're done.

---

## Architecture / Tech debt

### Wrap content sections in `<Card>` for true theming
**What:** MainContent's sections, ListView rows, and MobileListItem don't currently render inside a themed surface — they sit directly on the page background. Wrapping them in `<Card>` would give them proper `bg-card` backgrounds that flip with theme.
**Why deferred:** Works today because the page bg is dark in both light and dark mode for every theme *except* Bookstore. Wrapping in Cards is a UI redesign — visually different even in light mode.
**Update (2026-06-05):** No longer the only path to a light page. The page-chrome token system (`--page-*`, see below + `docs/coding-standards.md`) gave the **Bookstore** theme a genuine light surface without wrapping anything in Cards. Revisit a Card wrap only if you want the dark-mode reference-screenshot aesthetic per-section.

### ~~Full theme-prep sweep of hardcoded text/bg colors~~ ✅ Done 2026-06-05
**What it was:** ~100 instances of `text-white`, `text-gray-N`, `rgba(255,255,255,X)`, `divide-black/40` across the page chrome (MainContent, ListView, Sidebar, navigation/, mobile/). The original plan was to swap to `text-foreground` / `text-muted-foreground`.
**What we actually did:** A plain `text-foreground` swap would have broken the dark page (near-black text on the dark overlay). Instead we introduced **semantic page-chrome tokens** (`--page-fg`, `--page-fg-muted`, `--page-surface`, `--page-divider`, …) in `src/styles/index.css` with dark defaults + a `[data-surface="bookstore"]` light override, mapped to Tailwind utilities (`text-page-fg`, `bg-page-surface`) via `@theme inline`. Page chrome now references those utilities — one override block repaints the whole app. This shipped as part of the Bookstore theme. See `docs/coding-standards.md` for the pattern.

### Add a real `tsconfig.json`
**What:** Repo has no `tsconfig.json` — vite uses defaults. Adding one would enable `strict: true`, better path mapping, explicit module resolution.
**Why deferred:** Build works without it.
**When to do:** First time the TS defaults bite you (silent `any`, ambiguous module resolution).

### Bundle splitting
**What:** Main chunk is ~702 KB (gzip 202 KB). Vite warns about chunks over 500 KB. Splitting via dynamic imports for dialogs / pages would help first-load time.
**Why deferred:** App is fast enough today.
**When to do:** If first-paint feels sluggish, or if you add more heavy features (charts, image processing).

### Migrate inline `style={{}}` to className with CSS vars
**What:** Many components do `style={{ background: currentTheme.X, color: 'white' }}`. Could be Tailwind utility classes with CSS vars (`bg-[var(--sidebar)]`). Easier to override, more consistent.
**Why deferred:** Scattered across many files, lots of grunt work for marginal benefit.
**When to do:** During a broader visual refresh — pair with the theme-prep sweep.

---

## Features

### Customizable user backgrounds
**What:** Original intent of the Ghibli background — let users pick/upload their own page background. Could store the choice in `preferences` table next to `background_colors`.
**Why deferred:** Color schemes UI was hidden (Settings → Appearance tab). Backgrounds were never wired up.
**When to do:** When you want to bring back user theming. Would need: upload UI, storage (Supabase Storage bucket), DB column for the chosen image URL, and the App.tsx overlay swap based on the selected background.

### Light variants for LandingPage and SignInPage
**What:** Both pages have hardcoded dark designs. The dark-mode toggle doesn't affect them.
**Why deferred:** They look fine as-is; auth flow doesn't need to flip with user preference.
**When to do:** When/if you re-theme the app and want full consistency.

### Mobile view completion
**What:** Earlier commit "working on mobile view" suggested incomplete mobile components.
**Why deferred:** Desktop view was the priority.
**When to do:** Before pitching the app to mobile users / before publishing.

### Username-only sign-up (no email required)
**What:** Let users sign up with just a username + password — no email — for users who don't want to link a real address.

**Approach — synthetic emails:** Supabase Auth requires an email as the identifier. The trick is to synthesize one when the user supplies only a username:
- Signup: `username "alice"` + password → call `supabase.auth.signUp({ email: 'alice@no-email.mycollection.local', password })`. Domain choice doesn't matter as long as it's consistent and not a real receivable domain.
- Sign-in: accept a single field that's either an email or a username. If it contains `@`, treat as email; otherwise append the synthetic domain.
- Email confirmation must be off for synthetic emails (which is fine — they're unreachable). Either disable confirmation globally or skip the confirm flow for the synthetic domain.

**Schema impact:**
- Add `unique` constraint on `profiles.username` (currently the column exists but isn't unique-enforced — two users could pick the same username today).
- Add a check constraint or app-level validation rejecting usernames that contain `@` (so they don't collide with the email parser).

**UI:**
- Sign-up form gains a mode toggle: "Email" / "Username only".
- Sign-in form: single combined "Email or username" input.

**The real downside — password recovery:**
- Email users can use Supabase's built-in password reset email link.
- Username-only users *cannot recover their password* if they forget it — there's no email to send the link to. Options to mitigate, in order of cost:
  1. Show a clear warning at signup: "Without an email, lost passwords cannot be recovered."
  2. Offer a one-time **recovery code** at signup (a random 12-character string) that the user must save. Recovery flow accepts username + recovery code → forced password reset. Requires a `recovery_codes` table with hashed codes.
  3. Offer to *upgrade* a username-only account to an email account later: change `email` on the auth row from synthetic to a real address, send confirmation. Supabase supports email change.

**When to do:** When you actually have users asking for it. Until then it's optional complexity. Schema/RLS work is light; the recovery-code system (if added) is the biggest chunk.

### Friend system (view-only list sharing)
**What:** Users can send friend requests, accept/decline, and view friends' lists in read-only mode. Each user has a "list visibility" setting (private / friends-only / public).
**Schema impact:** New `friendships` table — columns `(user_id_a, user_id_b, status)` with status `pending | accepted | blocked`. RLS: a user can SELECT rows where they're either party; INSERT only with self as `user_id_a`; UPDATE only as `user_id_b` (to accept/decline). Also add `list_visibility` column to `profiles`, default `private`.
**UI:** Search-by-username flow, friend request inbox, friends-list page, "View as friend" mode on the existing item grid that hides edit/delete controls.
**Privacy:** Read-only must be enforced at BOTH the UI layer (no edit buttons rendered) AND the RLS policy layer (a friend's SELECT policy can read items where the owner has set visibility=friends-only; UPDATE/DELETE policies must still reject non-owners). Never trust the UI alone for access control.
**When to do:** When you have multiple real users wanting to share. Until then it's not worth the schema overhead.

### Recommend an item to a friend (with a note)
**What:** From inside an item (or via a button on the item card), the user can pick a friend and send the item as a recommendation with an optional note like "you'd love this — way better than the sequel." The friend sees recommendations in a new section (likely a "Recommendations" tab in the FriendsDialog, or a small badge on the gear icon) and can:
- Add the item to their own collection (status defaults to "want to see").
- Dismiss the recommendation.
- See who recommended it and the note.

Depends on the friend system (already shipped). Mid-effort (~2-3 hours).

**Schema:**
- New `recommendations` table — columns `(id, from_user_id, to_user_id, item_snapshot jsonb, note text, status, created_at, updated_at)`.
- `item_snapshot` holds a copy of the recommended item's title/year/posterUrl/etc. at the time of recommendation. We snapshot instead of foreign-key-ing to `collection_items.id` so the recommendation survives if the sender later deletes the item from their collection.
- `status` enum: `pending | added | dismissed`.
- RLS: both parties can read rows where they're `from_user_id` or `to_user_id`; only the sender can INSERT (with self as `from_user_id`); only the receiver can UPDATE status; either can DELETE.
- Add `unique (from_user_id, to_user_id, (item_snapshot->>'title'))` or similar to prevent spamming the same item.

**UI:**
- `<RecommendButton>` on each item card / detail dialog (visible only when the user has at least one accepted friend).
- Recommendation modal: friend picker + note textarea + Send.
- New "Recommendations" tab in FriendsDialog: shows incoming pending recommendations with "Add to my collection" / "Dismiss" actions.
- Light notification: small dot on the gear icon when there are unread recommendations.

**Open design questions:**
- One item to multiple friends in a single action, or one-at-a-time? (Probably one-at-a-time for v1 — simpler.)
- Should the recipient see the sender's whole collection through the recommendation? No — keep it scoped to the single item.

### Shared / collaborative lists (both can edit)
**What:** A user can share a list (or a custom section / sublist) with friends so they can both add, edit, and delete items in it. Distinct from the read-only friend view above.
**Schema impact:** Bigger refactor — currently `collection_items.user_id` is the sole owner. For shared lists you need either:
- **(a) List-level sharing:** new `shared_lists` table `(list_id, owner_id)` + `list_members(list_id, user_id, role)` + change items to reference `list_id` instead of (or alongside) `user_id`. Cleaner for whole-list sharing.
- **(b) Item-level sharing:** permissions table `item_collaborators(item_id, user_id)`. More flexible but harder to express in RLS.
Option (a) is the usual answer for this kind of feature.
**UI:** "Share list" button on a tab/section, invite-by-friend flow, indicator showing co-owners on shared sections. Possibly an activity feed ("Bob added 3 items to Restaurants").
**Conflicts:** Two users editing simultaneously needs a story. Supabase Realtime can subscribe to row changes for live sync, but pick a conflict policy upfront — last-write-wins is simplest; CRDT-style merging is overkill for this app.
**When to do:** AFTER the friend system above (depends on it). This is a multi-week feature with real edge cases — not a weekend project.

---

## UX polish

### Toast/banner for Supabase failures
**What:** Several `supabase` calls currently just `console.error` on failure (e.g., `usePreferences.ts` upsert). User has no visible feedback when persistence breaks.
**Why deferred:** Demo mode hides the issue; happy path works fine.
**When to do:** Before you start relying on Supabase for real user data — at the latest, when you onboard a non-demo user.

### Bring the Appearance tab back
**What:** Settings → Appearance was hidden (per-content-type color pickers). Could re-enable when ColorPicker UI is theme-aware AND backgrounds support is built.
**Why deferred:** User asked to hide it for now; ColorPicker code stayed intact.
**When to do:** When the customizable-backgrounds feature lands.

### Match accent color to dark theme
**What:** Sidebar hover states still use `currentTheme.accentColor` (Ghibli green) even in dark mode. The dark palette has a bright blue accent (`hsl(210 100% 56%)`) that's more cohesive.
**Why deferred:** User accepted the inconsistency.
**When to do:** Quick polish pass — swap `currentTheme.accentColor` references to `isDark ? 'var(--primary)' : currentTheme.accentColor`.

---

## Operations / Security

### Run `npm audit fix`
**What:** Last `npm install` reported 3 vulnerabilities (1 moderate, 2 high).
**Why deferred:** Unrelated to current work.
**When to do:** Before any production push. Run `npm audit` first to see what's affected; `--force` only if minor versions look safe.

### Smoke-test the auth/persistence flow end-to-end
**What:** Sign up a real user via Supabase, add an item, sign out, sign back in, verify the item is there. Verify RLS by trying to read another user's row.
**Why deferred:** Got pulled into other work; never circled back.
**When to do:** Top of your next session. This is the original "what's next" from when we set up Supabase.

### Verify `schema.sql` actually ran in Supabase
**What:** The schema file exists at `supabase/schema.sql` and the env vars are set, but we never confirmed it was executed in the Supabase SQL Editor.
**Why deferred:** Same as above.
**When to do:** Same as above — before any persistence actually works.

---

## Code quality

### Tests for pure utilities
**What:** `src/utils/csv.ts`, `src/utils/sanitize.ts`, `src/utils/contentHelpers.ts` are pure functions — easy targets for Vitest.
**Why deferred:** No test infrastructure exists.
**When to do:** First time you regress one of these (e.g., a CSV import bug). Cheap to set up once a real bug forces it.

### Optimize the Ghibli PNG
**What:** `src/assets/dd104f7b8489f1285cea3966c272ab6ab1c18fb9.png` is 2.1 MB. Renders at 5% opacity — could be much smaller (compress, convert to webp, or downscale).
**Why deferred:** Bundle size is acceptable today.
**When to do:** If load time becomes an issue, or as a defensive trim before publishing.

### Replace `figma:asset/...` vite alias with a regular import
**What:** The Ghibli image is imported via a `figma:asset/long-hash.png` alias that maps to the real path in vite.config.ts. Unusual pattern (Figma export tooling artifact).
**Why deferred:** Works fine.
**When to do:** Whenever you touch this area — convert to `import bg from './assets/background.png'` and drop the alias.

---

## Notes for future audits

When auditing for hardcoded colors, **before recommending a swap, check whether the element renders inside a themed surface** (Dialog, Card, Popover — these flip with theme) or directly on the page background (which is dark in both modes today). Hardcoded `text-white` on the page background is **correct**, not a bug. See [project-visible-bg-is-dark-in-both-modes memory] for the full reasoning.
