# TODO

Short list of concrete next actions, prioritized. Cross items off as you finish them. For the full long-term backlog see [ideas.md](./ideas.md).

---

## 🔴 Top priority — do these next

### 1. Verify Supabase is wired up end-to-end
This has been hanging since the very first session. Nothing real works until it's verified.

Steps:
1. Open your Supabase project dashboard → **SQL Editor** → **+ New query**.
2. Paste the contents of [supabase/schema.sql](../supabase/schema.sql) → **Run**. Should see "Success. No rows returned."
3. In the running app, click **Sign Up**, create a test account with a real email.
4. Confirm via the email link (or disable email confirmation in **Authentication → Providers → Email** in Supabase if you don't want to confirm every test signup).
5. Add an item, sign out, sign back in. Confirm the item is still there.
6. As a bonus: verify RLS by signing up a second user and confirming they can't see the first user's items.

If anything in steps 1-6 breaks, that's the next thing to fix.

### 2. `npm audit fix`
3 vulnerabilities flagged since deps were installed (1 moderate, 2 high). Should be cleaned up before any production push.

```
npm audit              # see what's affected
npm audit fix          # auto-fix the non-breaking ones
npm audit fix --force  # only if needed AND the remaining issues look minor
```

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

### 6. Toast/banner on Supabase failures
A few places (e.g., `usePreferences.ts` upsert) just `console.error` on failure. User has no feedback when persistence breaks. Quick win once you start using real Supabase persistence.

### 7. Add tests for `utils/csv.ts`
The CSV utility is a perfect first test target — pure functions, clear inputs/outputs. Whenever you regress a CSV import this is the obvious thing to set up.

---

## 🌱 New feature ideas (longer-term)

Detailed write-ups for both are in [ideas.md](./ideas.md) under "Features":

- **Friend system (view-only list sharing)** — friend requests, view friends' lists read-only.
- **Shared / collaborative lists** — multiple users editing the same list together. Depends on the friend system being built first.

Both require Supabase schema additions and are multi-day features. Don't start without a clear plan.

---

_Last touched: 2026-05-13_
