# Errors & gotchas log

Running list of non-obvious bugs we ran into while building, with root cause + fix + lesson. Not a how-to or a runbook — just a reference so the same trap doesn't catch us twice. Newest at the top.

---

## Custom category ignored the icon I picked, and the next one hung on "Creating…"

**Symptom:** Two things, reported together after creating custom categories for the first time on a working `.env`:
1. Created a category, chose an icon in the picker — the sidebar showed a **star** instead.
2. Created a second category — the button stuck on **"Creating…"** permanently. No toast, no error, no way out but a page reload.

**Root cause 1 — the icon was never read.** `AddTabDialog` wrote the chosen icon name to `custom_tabs.icon` correctly, and `useCustomTabs` loaded it back into `CustomTab.icon` correctly. The value made the full round trip and then went nowhere: both chrome surfaces hardcoded the component.

```
Sidebar.tsx          icon={Star}   // ignored tab.icon
MobileBottomNav.tsx  icon: Star,   // ignored tab.icon
```

Nothing anywhere mapped the stored *name* (`"Trophy"`) to the *component* (`Trophy`), because you can't persist a React component — only its name — and no one had written the lookup. The picker's icon list lived as a private `availableIcons` const inside `AddTabDialog`, so the nav components had nothing to resolve against even if they'd tried.

**Root cause 2 — `setIsSaving(false)` was skipped on a throw.**

```js
setIsSaving(true);
const result = await onAdd({ ... });
setIsSaving(false);        // never runs if onAdd throws
```

`handleSupabaseError` only sees errors Supabase *returns* in `{ data, error }`. Anything that *throws* — a dropped connection, an aborted fetch, or `data.id` on a null row — propagates straight out of the `await`, skipping the reset. `isSaving` stays `true` forever, the submit button stays disabled and stays reading "Creating…", and because the throw is unhandled the user gets no toast either. Total silence.

We never pinned down what threw on that specific second attempt — the network tab wasn't open and it hasn't reproduced since. That's worth stating plainly: the fix makes the *failure mode* survivable and visible, but the trigger is still unidentified. If it recurs, there'll now be a toast naming it.

**Fix:**
- New `src/utils/tabIcons.ts` — `TAB_ICONS` (the picker list, moved out of the dialog) plus `getTabIcon(name)` resolving a stored name to a component, falling back to `Star` for unknown or missing names. Same role and shape as `builtInCategories.ts`. `AddTabDialog`, `Sidebar`, and `MobileBottomNav` all now read from it, so the list can't drift between the picker and what renders.
- `AddTabDialog.handleSubmit` wraps the `await` in `try/catch/finally`: `finally` always clears `isSaving`, and `catch` toasts the thrown error instead of swallowing it.
- `useCustomTabs.addCustomTab` guards `!data` explicitly rather than letting `data.id` throw.

**Lesson:**
- **A value that round-trips to the database isn't "wired up" until something renders it.** The insert worked, the select worked, the type had the field — everything looked done, and the feature was still visibly broken. Trace the value all the way to the pixel.
- **You can't persist a component, only a key.** Any time an enum-ish choice is stored as a string, there's a lookup that has to exist somewhere. Put it next to the list of options, exported, once — not privately inside the picker that happens to have been written first.
- **`await` + a manual "reset the flag" line is a bug waiting to happen.** If the flag is cleared on the happy path only, the first thrown error strands the UI forever. `finally` is the only correct place for it.
- **A caught-and-toasted error and an uncaught throw look identical to the user until they don't.** `handleSupabaseError` covers returned errors thoroughly enough that it's easy to assume it covers everything. It doesn't — it never sees a throw.

---

## A missing `.env` makes finished features look deleted

**Symptom:** In a freshly rebuilt Codespace, "Add Category" (and by extension "Add Subcategory") appeared to have been removed. Click the button, fill in a name, submit — the dialog closes and **no category appears**. Nothing in the UI says why. The natural conclusion was that the feature had been reverted at some point and needed re-implementing.

It hadn't. Every layer was intact and had been since todo J was closed on 2026-06-06: the Sidebar button, `SubCategoryNav`'s "Add Subcategory", both mobile entry points, `AddTabDialog` / `AddSectionDialog`, `useCustomTabs` / `useCustomSections`, and the `custom_tabs` / `custom_sections` tables with all four RLS policies. `npm run typecheck` was clean and 120 tests passed.

**Root cause:** There was no `.env`. It's gitignored (correctly — it holds Supabase credentials), so it did not survive the Codespace rebuild; only `.env.example` is in the repo.

Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, `src/lib/supabase.ts` builds a client against empty strings. Every write fails. In `useCustomTabs.addCustomTab` the failure is caught by `handleSupabaseError`, which returns `true`, so `addCustomTab` returns `null`. App.tsx then — *correctly*, this is the todo-J fix working as designed — declines to `setContentType` to a category that doesn't exist. The result is a well-behaved no-op that is visually indistinguishable from a missing feature.

The one visible thread was the test suite: `uploadAvatar.test.ts` failed with `Error: supabaseUrl is required.` while every other suite passed.

**Fix:** `cp .env.example .env` and fill in the project URL and the publishable/anon key from the Supabase dashboard (Settings → API). No code change — there was never a code bug.

**Lesson:**
- **Check the environment before you read the code.** When a Supabase-backed write silently does nothing, `ls .env` is a two-second check that should come first. We spent a session reading a fully-working feature.
- **Test as the demo user to bisect this instantly.** Demo paths (`isDemoUser`) use localStorage and never touch Supabase. If a feature works in demo but not signed-in, it's credentials or RLS — not the feature.
- **Swallowing an error and returning `null` is correct, but it's not enough.** The J fix deliberately stopped fabricating a fake `temp-…` tab, which was right. But the user still gets no feedback distinguishing "the server rejected this" from "nothing happened". A toast on the `null` path — or better, a startup check that surfaces "Supabase is not configured" once, loudly — would have made this self-diagnosing. Worth doing; see todo U.
- **Gitignored files are a rebuild hazard, not just a secrets concern.** Anything not in the repo is gone when the Codespace is rebuilt. `.env` is the one that bites, because its absence degrades silently rather than crashing.

---

## First "Add" attempt silently fails; the second one works

**Symptom:** Open the Add Item dialog, type a title, click Add → dialog closes (or stays open) but **no item appears in the list**. Reopen the dialog, type the same title again, click Add → works fine.

**Root cause:** The populate-on-open `useEffect` in `useItemForm` had `[open, item, activeSection, customSections, contentType]` as its dependency list. That looks reasonable — those are the values the effect *reads* to decide what to seed the form with — but it has a nasty interaction: any time React re-runs the parent and creates a fresh array reference for `customSections` (or any of those other deps changes for any reason), the effect re-fires and resets every form field back to its empty initial value. Including the title the user has just typed.

The race that actually triggered it: dialog opens before `useCustomSections` has finished hydrating from Supabase. A few hundred ms later the hook resolves and pushes a new (non-empty) array, which has a different reference than the empty placeholder `customSections` started at. The effect re-fires, the title is reset to `''`, the user clicks Add, the `if (!title.trim()) return` guard inside `handleSubmit` bails silently → nothing happens.

The second attempt works because by then `customSections` is stable, the effect doesn't re-fire, the title sticks.

**Fix:** Narrow the dependency list to just `[open, item]` — the only two values whose change SHOULD re-populate the form (dialog opens, or the user is editing a different item). Read the latest values of `activeSection` / `customSections` / `contentType` *inside* the effect via refs that are updated on every render, so the effect can see fresh values without depending on them. `// eslint-disable-next-line react-hooks/exhaustive-deps` on the dep line because we're deliberately violating the exhaustive-deps lint to fix this exact class of bug.

**Lesson:**
- **`useEffect` dependency lists must distinguish "read" from "re-trigger".** `useEffect` re-runs whenever a dep changes by reference. If you only need a value to be readable *when* the effect fires (not to *cause* the effect to fire), it doesn't belong in the deps. Use a ref that's updated on render.
- **A populate-on-open effect should generally depend ONLY on the open transition.** Adding "everything I read inside" to the deps will re-fire mid-edit and clobber user input every time the parent re-renders.
- **Async-loading parent state is the silent killer.** Even if the user's interaction doesn't touch a dep, the parent's async data hydration WILL — and you won't see it during local dev with a hot cache. Test under cold-start conditions (hard refresh of a signed-in user, slow network) to catch this class of bug.
- This bug existed for many months before we caught it. It would have stayed forever if we kept assuming "first attempt failed because I was too quick" — small intermittent UX failures are worth tracing, not shrugging at.

---

## Refresh dumped me on Movies + flashed sign-in + flashed default theme

**Symptom:** Three separate annoyances all from one browser refresh:
1. Selected a category (e.g. TV Shows) → refresh → landed back on Movies instead.
2. Briefly saw the sign-in page (default colours) before the main app rendered.
3. Even after fix #2, briefly saw a purple Ghibli background before the user's actual Coffee theme painted.

**Root causes (three different layers):**

1. **No persistence on UI state.** `contentType` / `activeSection` / `expandedCategory` were declared as `useState(DEFAULT)` — re-initialised to the hardcoded default on every mount. localStorage wasn't being touched at all.

2. **Hydration window fell into the sign-in branch.** App.tsx's auth gating had `if (!auth.isSignedIn || isHydratingUserData) → SignInPage`. The `isHydratingUserData` half of that OR meant a signed-in user whose data was still loading still got SignInPage (with `externalLoading=true` for the spinner). Functionally a loading state but visually it rendered the entire sign-in form.

3. **Decorative overlays painted with stale theme data.** The Ghibli + gradient overlays in App.tsx render based on `isCoffeeActive` / `currentTheme.backgroundGradient`, both derived from `usePreferences`. Preferences initialise to defaults and only update after the Supabase fetch returns — so during the spinner phase the user's actual theme wasn't known yet and the default (purple Ghibli) overlay painted briefly even for Coffee users.

**Fixes (one per layer):**

1. New `useLocalStorageState` hook (a thin `useState` wrapper that reads on init and writes on change). App.tsx swapped the three `useState` calls for it. Also had to gate the "reset activeSection to 'all' on contentType change" effect with a `didMount` ref so the initial mount doesn't clobber the persisted activeSection.

2. App.tsx loading gating restructured: `if (auth.isLoading || isHydratingUserData) → spinner` instead of letting hydration fall into the sign-in branch. The SignInPage now only renders when the user actually needs to sign in (no spinner mode on it any more).

3. Two-part theme cache:
   - App.tsx mirrors `surfaceTheme` ('coffee' / 'default') into localStorage on every change.
   - main.tsx reads that cache **synchronously** before React mounts, setting `data-surface="coffee"` on `<html>` if needed. CSS variables flip to cream **before** the first paint.
   - Plus a guard in App.tsx render: `if (auth.isLoading || isHydratingUserData) → don't paint the decorative overlays at all`. The `bg-background` token underneath is already theme-aware via `data-surface`, so the spinner sits on the correct flat colour.

**Lesson:**
- **Persist anything the user picked from the UI that should survive a refresh.** `useState` defaults are fine for ephemeral UI state, but anything they actively chose (category, section, theme toggle) deserves localStorage at minimum.
- **Loading states should be neutral.** When you're "between" two real pages, render a spinner, not one of the pages with a loading prop bolted on. Mixed-purpose components (page-that-pretends-to-be-a-loader) leak visual artifacts.
- **For first-paint state, the synchronous path matters.** Anything that controls page colours / layout has to apply before React's first render. localStorage reads in `main.tsx` (or even an inline `<script>` in `index.html`) are free and bulletproof; waiting for a React effect or a Supabase fetch is too slow — you get a flash.

---

## Vercel deploy failed silently after "modules transformed"

**Symptom:** Build log showed `✓ 1839 modules transformed.` and then "Deployment failed with error" — no obvious failure in vite output.

**Root cause:** `vite.config.ts` had `build.outDir: 'build'`. Vercel's Vite preset looks for the default `dist/`. Vite succeeded, Vercel couldn't find the artifacts.

**Fix:** Set `outDir: 'dist'` (or override Output Directory in Vercel settings to `build`).

**Lesson:** Hosting providers have framework-default assumptions baked in. Match the convention or override it explicitly — don't quietly diverge from the default.

---

## Sidebar invisible at narrow viewport widths

**Symptom:** After adding `lg:translate-x-0` for the responsive sidebar, the sidebar never showed up at any width — only the hamburger was visible.

**Root cause:** Project shipped a static prebuilt `index.css` with no Tailwind JIT. `lg:translate-x-0` and `lg:hidden` weren't in the prebuilt sheet, so they were no-ops. Element fell back to the base `translate-x(-100%)` and never came back.

**Fix:** Replaced the Tailwind responsive utilities with hand-written CSS rules inside `@media (min-width: ...)` blocks. Long term: wired up `@tailwindcss/vite` so the JIT generates whatever's in source (todo D).

**Lesson:** Before reaching for a Tailwind utility, confirm the project has a working JIT pipeline. A prebuilt stylesheet is a frozen subset — new utilities silently fail.

---

## Notification dot landing at top-left instead of bottom-right

**Symptom:** Set `absolute -bottom-1.5 -right-1.5` on a span. Rendered at top-left of the parent instead.

**Root cause:** Same JIT issue. `-bottom-1.5` and `-right-1.5` weren't generated, so the absolute element fell back to defaults (top: 0, left: 0).

**Fix:** Inline style `{ bottom: '0px', right: '0px' }` — guaranteed regardless of what utilities exist.

**Lesson:** For exact positioning, inline style is more reliable than Tailwind utilities when you can't trust the JIT. Save utilities for things where defaults are sane.

---

## Tailwind arbitrary value with commas didn't generate

**Symptom:** `shadow-[0_0_6px_2px_rgba(255,255,255,1)]` produced no CSS — the glow effect never rendered.

**Root cause:** Tailwind's class scanner sometimes chokes on commas inside arbitrary values, especially in `rgba()`. The class was treated as malformed.

**Fix:** Move the box-shadow to an inline `style={{ boxShadow: '...' }}`.

**Lesson:** For complex CSS values with commas / spaces / nested functions, inline style is friendlier than Tailwind arbitrary syntax. Tailwind shines for short, well-known values.

---

## Active tab text wouldn't turn white

**Symptom:** Set `className="text-white data-[state=active]:bg-white data-[state=active]:text-black"` on a TabsTrigger. The bg-white worked, text-black worked, but inactive `text-white` did nothing — text stayed dark.

**Root cause:** Two issues combined:
1. The shadcn TabsTrigger base class has `text-foreground` (and `dark:text-muted-foreground`) directly on the element. My `text-white` from the prop and the base class had equal specificity. `tailwind-merge` should pick the prop-supplied class, but the `dark:` variant cascade was beating both in dark mode.
2. The `!`-modifier (`text-white!`) was Tailwind v4 syntax but the prebuilt CSS didn't generate it.

**Fix:** Wrote a custom CSS class `.friend-tab-trigger` with `color: #ffffff !important` and data-state attribute selectors. Bypassed the whole utility-cascade mess.

**Lesson:** When you find yourself fighting Tailwind utility specificity / variant chains, escape to a small custom CSS class. Cleaner to read, deterministic to apply. Also a sign the project's CSS pipeline needs an upgrade.

---

## Hover utility on a button did nothing

**Symptom:** Added `NAV_HOVER_CLASS` (`hover:bg-white/10`) to subcategory rows. The "Add Subcategory" button lit up on hover, but the subcategory rows didn't.

**Root cause:** SectionButton had `style={{ backgroundColor: 'transparent' }}` set inline for the inactive state. Inline styles win over Tailwind utilities on the same property (`background-color`). The hover utility was generating CSS but couldn't paint over the inline rule.

**Fix:** Drop the inline `backgroundColor: 'transparent'` — transparent is the default anyway, no need to set it.

**Lesson:** Inline styles override `hover:` (and all Tailwind utilities) for the same property. If hover isn't visible, check whether you're setting that property inline first.

Related: for the sidebar's CategoryButton (which legitimately needs an inline navy gradient), the hover overlay can't paint either. Workaround: stack `hover:brightness-110` alongside `hover:bg-white/10` so at least one effect lifts the element regardless of background.

---

## "Username already taken" after deleting the user

**Symptom:** Deleted a test account from Supabase Auth → tried to re-sign-up with the same username → got "username taken".

**Root cause:** `public.profiles.id` had a foreign-key to `auth.users(id)` but **without** `on delete cascade`. The `schema.sql` definition included cascade in the `CREATE TABLE` clause, but `create table if not exists` is a no-op for existing tables — it doesn't amend the live constraint. So the original (cascade-less) FK from before the schema edit stayed in place. Deleting the auth user left the profile row orphaned, still holding the username.

**Fix:** One-time cleanup query: `delete from public.profiles where id not in (select id from auth.users);`. Then drop and re-add the FK with explicit `on delete cascade`. Both shipped in `supabase/cleanup_orphan_profiles.sql`.

**Lesson:** Editing a `CREATE TABLE IF NOT EXISTS` block in your schema doesn't change anything for tables that already exist. Constraints / defaults / column types need explicit `ALTER TABLE` migrations against the live database.

---

## Friend invite invisible to the recipient

**Symptom:** Sender's account showed the invite as "Pending". Recipient's Friends → Requests tab showed nothing.

**Root cause:** The `useFriends` hook fetched the friendship row (RLS on `friendships` allowed it for both parties) then called `fetchProfilesByIds` to decorate it with the sender's name. The `profiles` table only had a "Users can read their own profile" RLS policy. The recipient couldn't read the sender's profile, `fetchProfilesByIds` returned empty, and `decorate` silently dropped the row because there was no matching profile.

**Fix:** Added a second RLS policy on `profiles`: "Users can read profiles of friendship counterparts" — allows reading any profile you share a friendship row with (any status, so pending requests resolve too).

**Lesson:** RLS failures often manifest as **silent empty data**, not errors. When debugging "row exists in DB but UI shows nothing," check whether every join / decorate step in the data layer has RLS coverage. The fix is usually adding a permissive policy scoped to a relationship, not loosening RLS globally.

---

## Refresh flashed through Landing → SignIn → main app

**Symptom:** Signed-in user hits browser refresh. Sees three pages in quick succession instead of going straight to their main view.

**Root cause:** App.tsx branching order was:
1. `showPasswordResetPage` → reset page
2. `!isSignedIn || isHydratingUserData` → SignIn or Landing
3. else → main app

On mount, `isSignedIn=false` (default) → branch 2 → Landing. Session check completes, `isSignedIn=true`, but `isHydratingUserData=true` → still branch 2, now showing SignIn with a spinner. Data finishes loading → branch 3 (main). Three renders, three flashes.

**Fix:** Added a leading `if (auth.isLoading) → <Spinner />` branch. While the initial `getSession()` is in flight, render a neutral spinner instead of falling through to "logged-out landing".

**Lesson:** Boolean state that starts at `false` and asynchronously flips to `true` will render its false-branch first. If false-branch is a user-visible page (not a loading state), you get a flash. Always gate page-level fallbacks on a `isReady` / `isLoading` flag, not just the boolean itself.

---

## Wrapper div widened the dropdown trigger's bounding box

**Symptom:** Notification dot positioned `-right-1` on a div wrapping the gear Button rendered far from the actual button — looked like it was floating in empty space.

**Root cause:** Wrapped Button in `<div className="relative">` so the dot could anchor to it. The div defaulted to `display: block`, so it spanned the full width of its flex slot — wider than the button. `-right-1` measured from the div's right edge, not the button's.

**Fix:** Use `inline-flex` on the wrapper so it shrink-wraps the button.

**Lesson:** `position: relative` makes a div the anchor for absolute children, but doesn't change its sizing. If you want the anchor to match the visual element's box, the wrapper needs `inline-block` / `inline-flex` (or set its width explicitly).

---

## Horizontal scroll let content slide UNDER the fixed sidebar

**Symptom:** Sidebar is `position: fixed`. Long item title forced a horizontal scrollbar. Scrolling right made the content slide under the sidebar — sidebar stayed put, content moved.

**Root cause:** `position: fixed` elements don't move with horizontal page scroll (by design). If the body gains a horizontal scroll, the fixed sidebar is the only thing that *doesn't* scroll, so everything else slides under it.

**Fix:** Two-part:
1. `min-width: 0` on the flex main column so it can shrink below its content's intrinsic width.
2. `overflow-x: hidden` on the body as a safety net for any child that resists shrinking.

**Lesson:** Flex items default to `min-width: auto`, which means they refuse to shrink below their content. When you wrap a fixed sidebar + flex main column, always set `min-width: 0` on the main column. And put `overflow-x: hidden` on body to belt-and-braces against unexpected wide content.


## Games count showed 0 even though items array clearly had 30 games

**Symptom:** Sidebar's main "Games" CategoryButton showed `0` next to the icon. Under it, the SubCategoryNav (All / Played / Want to Play / Favorites) showed the correct counts — All (30), Played (19), Want to Play (11), Favorites (6). Movies/TV/Restaurants/Places counts on the same sidebar all rendered correctly. Only Games was 0.

**Diagnosis dead-ends:**
- Cleared Vite's `node_modules/.vite` cache → no change.
- Hard-refreshed the browser, cleared site data → no change.
- Wrote a sanity test against `mockItems`: 40/40/20/20/30 split with literal `type === 'game'` → all green.
- Added a `console.log` to `useCollectionStats`: confirmed `byType.game: 30`, `totalItems: 150`, and `sampleGameTypes` contained real game entries.

So the hook returned `gameCount: 30`. The Sidebar received `0`. The bug had to be on the prop-threading hop between them.

**Root cause:** `SidebarLayout` is the desktop ↔ mobile branching component. When the L commit added the Gaming category, the *mobile* branch was updated to pass `gameCount` down (line 158), but the desktop `<Sidebar>` JSX was *not* — `gameCount` was simply omitted. Sidebar destructures `gameCount` with no default; `countById['game']` becomes `undefined`; `count={countById[category.id] ?? 0}` renders `0`.

`SidebarProps.gameCount: number` is required — TypeScript should have caught the missing prop. It didn't, because **the project has no `tsconfig.json`** and Vite + SWC do not typecheck source files at build time. Type errors that would fail `tsc --noEmit` ship to runtime as silent bugs.

**Fix:** Pass `gameCount={gameCount}` (and `visibleCategories={visibleCategories}`, which was missing for the same reason) in the desktop `<Sidebar>` JSX inside `SidebarLayout`.

**Lessons:**
1. **No tsconfig means no type safety at build.** Worth a separate todo: add `tsconfig.json` and a `npm run typecheck` script that runs `tsc --noEmit`, then wire it into CI / pre-push.
2. **Branch-and-mirror components are the highest-risk site for prop drift.** Any time the mobile branch and desktop branch both render the same downstream component, every new prop must be added in two places. Worth considering a single object-spread (`<Sidebar {...sidebarProps} />`) so a missed field becomes a destructuring miss instead of silently-undefined.
3. **"Movies works but Games doesn't" is diagnostic.** Identical render pipeline, only the most recently-added field is wrong → it's a prop wiring miss for that field, not a counting bug. Should have been my first hypothesis, not the last.
