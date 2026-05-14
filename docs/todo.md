# TODO

Short list of concrete next actions, prioritized. Cross items off as you finish them. For the full long-term backlog see [ideas.md](./ideas.md).

---

## 🔴 Top priority — do these next

### 1. ~~Verify schema applied in Supabase~~ ✅ Done 2026-05-14
Tables, policies, and `handle_new_user` trigger all confirmed in the Supabase dashboard.

### 2. End-to-end smoke test (currently in progress)
Sign-up + auth + persistence round-trip. Steps remaining:
- Sign up a real test account through `npm run dev`
- Confirm via email (or disable email confirmation in Supabase under **Authentication → Providers → Email**)
- Add an item, verify it appears in `collection_items` in the Supabase Table Editor
- Sign out, sign back in, confirm the item is still there
- (Bonus) Sign up a second user and confirm RLS prevents them from reading the first user's items

### 3. `npm audit fix`
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

_Last touched: 2026-05-14_
