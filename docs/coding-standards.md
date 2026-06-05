# Coding standards

The conventions this project follows. The throughline is **one source of truth**: any value, string, or rule should live in exactly one place so a change happens once and can't drift. These aren't aspirational — they're how the existing code is built, and new code should match.

Use this as a checklist before opening a PR (or before asking an AI assistant to write code — paste the relevant section into the prompt).

---

## 1. Never hardcode a value that's used more than once

If a color, string, gradient, magic number, or className combo appears in two places, it must be extracted to a single named source. The second occurrence is the signal.

**Where extracted things live:**
| Kind | Home | Example |
|---|---|---|
| Content-type / status strings | `src/constants.ts` (`as const` + derived union types) | `'watched'`, `DEFAULT_CONTENT_TYPE` |
| Colour themes (gradients, accent) | `src/utils/themeConfig.ts` (`colorThemes`) | `bookstore` theme entry |
| Surface backgrounds | `src/utils/surfaceBackgrounds.ts` | `NAVY_SURFACE_BACKGROUND` |
| Hover/interaction classes | `src/utils/hoverStyles.ts`, `src/utils/accentHover.ts` | `NAV_HOVER_CLASS` |
| Page-chrome colours | CSS variables in `src/styles/index.css` | `--page-fg`, `--page-surface` |
| localStorage keys | `src/constants.ts` (`STORAGE_KEYS`) | user-scoped key builders |

**Rule of thumb:** before typing a literal (`'#fff'`, `'rgba(...)'`, `'watched'`, a repeated class string), check whether a token/constant already exists. If you're adding the second copy of anything, stop and extract it first.

---

## 2. Colours come from tokens, never literals — especially in page chrome

This is the pattern we used to make the **Bookstore** light theme possible, and it's the model for any future theming.

**The problem:** the page chrome (Sidebar, main content, ListView, mobile chrome) sits directly on the page background and used to hardcode `text-white` / `text-gray-400` / `rgba(255,255,255,.1)` ~100 times. That made a true light theme impossible without editing every call site — and impossible to keep consistent.

**The fix — semantic CSS variables mapped to Tailwind utilities:**

1. Define tokens in `src/styles/index.css` with the **current values as `:root` defaults** (so nothing changes visually):
   ```css
   :root { --page-fg: #fff; --page-surface: rgba(255,255,255,.1); /* … */ }
   ```
2. Add **one override block** per alternate surface:
   ```css
   [data-surface="bookstore"] { --page-fg: hsl(28,18%,18%); --page-surface: hsl(33,35%,92%); /* … */ }
   ```
3. Map tokens → utilities once, via Tailwind v4 `@theme inline`:
   ```css
   @theme inline { --color-page-fg: var(--page-fg); --color-page-surface: var(--page-surface); }
   ```
4. Components use the **semantic utility**, never a literal:
   ```diff
   - <div className="text-white bg-white/10">
   + <div className="text-page-fg bg-page-surface">
   ```

Now switching the whole app's chrome is one `data-surface` attribute + one override block. Adding a third surface = one more block. No component edits.

**Do / Don't:**
- ✅ `text-page-fg`, `bg-page-surface`, `border-page-divider` for anything on the page background.
- ✅ `text-foreground`, `bg-card`, `text-muted-foreground` (next-themes shadcn tokens) for anything inside a **Card / Dialog / Popover** surface.
- ❌ `text-white`, `text-gray-400`, `rgba(255,255,255,…)`, `#fff` in a component.
- ⚠️ **Know which layer you're on.** Radix Dialog/DropdownMenu/Popover *portal to `document.body`*, outside the `data-surface` root — so `--page-*` tokens there fall back to defaults. Page chrome → `--page-*`; themed surfaces → shadcn tokens; portaled menus stay dark by design. (See `docs/overview.md` → "Theme-aware styling".)
- When a colour helper takes opacity, make sure it supports the formats you pass. We extended `colorToRgba` to handle `hsl()` → `hsla()` rather than appending a literal `30`/`cc` alpha suffix (which only works for hex). Centralize the conversion; don't sprinkle string concatenation.

---

## 3. Extract logic, not just styling

"One source of truth" applies to **all** code, not only CSS. Repeated helper logic, validation, formatting, and orchestration get their own home too.

- **Pure functions, separated from React** — `utils/csv.ts` (`parseCsvIntoItems`, `serializeItemsToCsv`) has no React/DOM/toasts; the hook `useDataExportImport.ts` wires them to file pickers + toasts. Pure logic stays trivially testable and reusable.
- **Shared component for a repeated pattern** — `ThemePrimaryButton` exists so the `<Button style={{ backgroundColor: accent }} className="text-page-fg …">` pattern lives in one place instead of every dialog footer.
- **A hook per responsibility** — `useItems`, `usePreferences`, `useDialogState`, `useItemActions`, etc. (see `docs/overview.md`).

---

## 4. Keep dual-mode (demo vs Supabase) isolated

Demo-account code, data, and UI stay inside demo-mode paths — they must not leak into real-user flows.

- Each data hook has a **single mode-switching block** at the top using `loadDemoData()` / `useDemoSync()` from `src/demo/`. The rest of the hook is mode-agnostic.
- Don't scatter `if (isDemoUser)` through component render code. Consolidate the boundary in `src/demo/`.
- Same isolation principle for swappable integrations: TMDB lives under `src/tmdb/`, mirroring `src/demo/`.

---

## 5. Persist new preference fields without a migration when you can

The `preferences.background_colors` column is JSONB. The Bookstore toggle added a new `surfaceTheme` key **inside that existing JSON** — no `ALTER TABLE`, no SQL file to run. Old rows deserialize the missing key as `undefined` and we merge over `DEFAULT_BACKGROUND_COLORS` so every field is always present.

- Prefer a new key in an existing JSONB blob over a new column for small, app-only flags.
- When a real schema change *is* needed: write an **idempotent** `.sql` file in `supabase/` (`create … if not exists`, `drop policy if exists` + `create policy`, `create or replace function`). The user runs it in the Supabase SQL Editor — there's no automated migration runner. Never assume a migration ran; the SQL must be safe to re-run.

---

## 6. Type safety

- **No `any`** outside constrained Supabase row casts.
- **Typed unions from `as const` arrays**, so renaming a value is a compile error everywhere it's used — not a silent runtime bug.
- Thread new props through the full chain with explicit interface additions (e.g. `isBookstoreActive` / `onToggleBookstore` added to both `SidebarLayoutProps` and `SidebarProps`), so TypeScript flags any missing wiring.

---

## 7. Verify before claiming done

- `npm run build` must pass (this is what Vercel runs — see `docs/errors.md` for the `outDir` gotcha).
- For styling/token work, confirm the utility classes and any override blocks actually appear in the built CSS (`dist/assets/index-*.css`) — an unrecognized Tailwind class is a silent no-op, not an error.
- Report outcomes honestly: if something wasn't visually click-tested, say so.

---

## Quick pre-commit checklist

- [ ] No new literal colour / magic string / repeated className — extracted to its token/constant?
- [ ] Page-chrome colours use `--page-*` utilities; surface colours use shadcn tokens?
- [ ] Repeated logic pulled into a util/hook/shared component?
- [ ] Demo-mode concerns contained in `src/demo/`?
- [ ] New props typed and threaded through every interface in the chain?
- [ ] `npm run build` passes; new CSS tokens present in the output?
