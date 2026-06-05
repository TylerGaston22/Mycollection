# My Collection — Project Overview

A personal collection tracker for movies, TV shows, restaurants, places, and user-defined item types. Built as a full-stack project to practice production-grade React + TypeScript + Supabase patterns end-to-end: real authentication, row-level security, type-safe data flow, dark mode, mobile-responsive UI, and CSV import/export.

> Demo mode (localStorage) is bundled so the app is fully functional without any backend setup. Sign in with `demo` / `demo` to try it.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React 18 + TypeScript | Industry standard, strong typing |
| Bundler / dev server | Vite 6 | Fast HMR, native ESM, modern defaults |
| Styling | Tailwind CSS v4 | Utility-first, theme tokens via CSS vars |
| UI primitives | Radix UI (shadcn-style) | Accessible, unstyled components I compose myself |
| Theme | `next-themes` | Persisted dark/light toggle with class strategy |
| Backend | Supabase (Postgres + Auth) | Hosted Postgres with RLS, built-in auth |
| Tables / lists | TanStack Table | Headless table for the ListView |
| Notifications | Sonner | Toast UI |
| Deployment target | Vercel | Set up but not yet live |

---

## Features

### Collection management
- Track items of any type — built-in (`movie`, `tv-show`, `restaurant`, `place`) or user-created custom tabs
- Per-item: title, year, status (`watched` / `want-to-see`), 1–5 star rating, favorite toggle, notes, platform, studio, genre, seasons/episodes for shows, poster URL
- Custom sub-sections within each tab to organize further
- Grid view (cards with posters) and table/list view (TanStack Table)
- Mobile-specific list and navigation components

### Authentication & persistence
- Two storage modes, fully abstracted:
  - **Demo mode** — `localStorage`-backed, seeded with sample items. No backend needed.
  - **Supabase mode** — Postgres-backed, auth via email + password, persists across devices.
- Demo and Supabase code paths are cleanly separated (`src/demo/` is the single boundary)
- One-click demo login on the sign-in page for visitors / interview viewers

### Data import / export
- JSON full-collection backup (export and import)
- CSV / TXT bulk import for migrating from spreadsheets
- Format-guide dialog with a copy-pasteable prompt for asking an LLM to format an unstructured list

### TMDB integration
- Search-by-title in the Add/Edit Item dialog: enter a movie/TV title, click the search icon, pick a result to auto-fill title, year, and poster URL.
- All TMDB code isolated under `src/tmdb/` (mirrors the `src/demo/` pattern) — easy to swap out or remove.
- Degrades gracefully when `VITE_TMDB_TOKEN` isn't set: the search button hides itself, the form still works.

### UI / UX
- Dark mode toggle (cohesive dark blue-grey palette with bright blue accent) via the gear-icon dropdown.
- **Bookstore theme** — a one-click app-wide *light* cream theme (warm palette from `bookstorecode/`) toggled from the same gear-icon dropdown, alongside per-content-type colour themes picked in Settings.
- Tailwind palette remapping in dark mode so `slate-*` and `cyan-*` utility classes also reskin.
- Mobile-responsive: dedicated mobile components for header, bottom-nav, list items, section nav.
- Toasts for success/failure on every mutation.

---

## Security

### SQL injection — three layers of defense

1. **Supabase JS SDK parameterizes everything.** All `.eq()`, `.insert()`, `.update()`, `.delete()` calls send values as parameters separate from the SQL text. This is the equivalent of `prepare` + `bindValue` from raw SQL drivers. No string concatenation, no injection surface.
2. **Row-Level Security (RLS) on every table.** Every table has `auth.uid() = user_id` policies for SELECT/INSERT/UPDATE/DELETE. Even if a query slipped past the SDK, RLS prevents reading or modifying another user's data.
3. **Explicit `.eq('user_id', currentUserId)` filters on bulk operations.** Defense-in-depth — if RLS were ever misconfigured, the explicit filter still scopes the query.

### Other hardening
- **Content Security Policy** in `index.html` restricts `script-src` to `'self'`, `connect-src` to `'self'` + `*.supabase.co`. Blocks third-party scripts.
- **Input sanitization** — `utils/sanitize.ts` strips HTML from user-supplied strings and validates image URLs (`isValidImageUrl` rejects `javascript:` / `data:` protocols).
- **No `dangerouslySetInnerHTML`, `innerHTML`, or `eval`** anywhere — React's default JSX escaping handles user text.
- **Sensitive data** — no tokens or passwords in `localStorage`. Supabase manages auth tokens in its own secure storage.
- **`.env` gitignored**; `.env.example` carries only placeholder values. Supabase publishable key is the only public credential needed in the frontend (anon key by design).

---

## Architecture decisions

### Dual-mode storage abstraction
The challenge was supporting both demo (localStorage) and Supabase modes without scattering `if (isDemoUser)` branches everywhere. Solution: each data hook (`useItems`, `useCustomTabs`, `useCustomSections`, `usePreferences`) has a single mode-switching block at the top using two helpers from `src/demo/storage.ts` — `loadDemoData()` and `useDemoSync()`. The rest of the hook is mode-agnostic. Demo logic stays consolidated in `src/demo/`.

### Constants extracted, not scattered
`src/constants.ts` defines `CONTENT_TYPES`, `ITEM_STATUSES`, `DEFAULT_CONTENT_TYPE`, `RATING_MIN`/`RATING_MAX`, and `STORAGE_KEYS` (functions that build user-scoped localStorage keys). Magic strings like `'watched'` / `'want-to-see'` are typed unions derived from the const arrays, so renaming any value gives a TypeScript error wherever it's used.

### Pure utilities separated from React hooks
`utils/csv.ts` exports `parseCsvLine`, `parseCsvIntoItems`, and `serializeItemsToCsv` as pure functions — no React, no toasts, no DOM. The hook `useDataExportImport.ts` is the IO orchestrator that wires these into file pickers and user-facing toasts. This makes the CSV logic trivially testable and reusable.

### Component organization by feature
```
src/components/
  ├── navigation/  Sidebar, CategoryButton, SectionButton, SubCategoryNav, CategoryCountRow
  ├── layout/      SidebarLayout, MainContent
  ├── item/        ItemCard, ListView, StarRating, StatusBadge, StatusToggleMenuContent
  ├── settings/    ColorPicker, DataManagementButtons
  ├── dialogs/     All modal dialogs (form, detail, share, settings, etc.)
  ├── mobile/      Mobile-specific variants
  └── ui/          Radix wrappers (shadcn-style primitives)
```

### Hooks split by responsibility
- `useAuth` — auth state + sign in/up/out actions
- `useItems` — CRUD for collection items (dual-mode)
- `useCustomTabs` / `useCustomSections` — user-created categorization (dual-mode)
- `usePreferences` — theme/background preferences (dual-mode)
- `useDialogState` — keyed open/close state for 7 modal dialogs
- `useCollectionStats` — memoized per-type counts
- `useItemActions` — shared toggle/rate handlers used by grid + list views
- `useDataExportImport` — import/export orchestration
- `useIsMobile` — viewport detection

### Theme-aware styling via CSS variables
The app has **three independent styling layers**, all driven by CSS custom properties so components never hardcode a color:

1. **Surface tokens (`next-themes`)** — light/dark palettes defined as `--background`, `--foreground`, `--card`, etc. in `src/styles/index.css` (`:root` + `.dark`). Tailwind utilities (`bg-background`, `text-foreground`) resolve through these vars, so Cards/Dialogs/Popovers reskin automatically when the `dark` class flips. Tailwind's `slate-*` and `cyan-*` palettes are also remapped in dark mode for cohesive sidebar/accent coloring.
2. **Colour themes (`src/utils/themeConfig.ts`)** — a `colorThemes` record where each `ThemeConfig` supplies a `sidebarGradient`, `backgroundGradient`, and `accentColor`. Selected per content-type in Settings (`ColorPicker`) and persisted in `preferences.background_colors`. Drives the page background overlay and every accent-coloured element.
3. **Page-chrome tokens (`--page-*`)** — semantic variables (`--page-fg`, `--page-fg-muted`, `--page-surface`, `--page-divider`, `--page-backdrop`, …) for the persistent layout that sits *directly on the page background* (Sidebar, main content, ListView, mobile chrome) rather than on a themed Card surface. Their `:root` defaults equal the historical dark-page values; a single `[data-surface="bookstore"]` override block repaints the whole chrome cream. Mapped to Tailwind utilities (`text-page-fg`, `bg-page-surface`, `border-page-divider`) via `@theme inline`. This is what lets the **Bookstore** theme be a *genuine light surface* without un-hardcoding colors per-component — see `docs/coding-standards.md`.

**Why three layers:** Radix overlays (Dialog/DropdownMenu/Popover) portal to `document.body`, *outside* the App root that carries `data-surface`. So page chrome uses layer 3, themed surfaces use layer 1, and portaled menus deliberately stay dark even in Bookstore mode.

---

## Database schema

Five tables in Supabase, all with RLS enabled and `auth.uid() = user_id` policies:

| Table | Purpose |
|---|---|
| `profiles` | One row per user, auto-created via `handle_new_user` trigger on `auth.users` insert |
| `collection_items` | Polymorphic item table (movies/shows/restaurants/places/custom). `type` column drives content-type behavior. |
| `custom_tabs` | User-created category tabs beyond the four built-ins |
| `custom_sections` | Sub-sections within a tab |
| `preferences` | Per-user theme/background JSON preferences |

The schema lives in `supabase/schema.sql` and is fully idempotent — safe to re-run any number of times. Uses `create table if not exists`, `drop policy if exists` + `create policy`, and `create or replace function` patterns so a partial previous run doesn't block re-execution.

See `docs/er-diagram.md` for the full Mermaid ER diagram.

---

## Code quality practices

- **No `any` types** outside Supabase row casts (which are constrained via local type assertions)
- **Constants over magic strings** — typed `as const` arrays with derived union types
- **Defense in depth** on security (SDK + RLS + explicit filters)
- **Idempotent schema** — re-runnable migrations
- **Memory file system** — long-running collaboration notes (`docs/ideas.md`, `docs/todo.md`) keep deferred decisions visible
- **Commit hygiene** — focused commits, each with structured messages explaining the *why* not just the *what*

---

## What's not done yet

In rough priority order — see `docs/todo.md` and `docs/ideas.md` for detail:

- Address 3 npm-audit vulnerabilities before any production push
- Mobile view polish (incomplete)
- Username-only sign-up (no email required) — planned, schema sketched
- Friend system (view-only list sharing) — planned, schema sketched
- Collaborative shared lists — planned, depends on friend system
- Tests for the pure utilities (`utils/csv.ts`, `utils/sanitize.ts`)
- Vercel deploy (configured, not yet live)

## Verified working

- Sign-up + email/password sign-in via Supabase Auth.
- `handle_new_user` trigger auto-creates a profile row on signup.
- Items persist across sign-out / sign-in.
- RLS scopes data correctly (a user only sees their own rows in the read paths).
- TMDB search auto-fills title, year, and poster on the Add Item dialog.
- Dark mode toggle switches the full app palette (custom CSS variables + Tailwind palette remap).
- Bookstore light theme toggles app-wide (incl. custom tabs), persists across reloads (demo localStorage + Supabase), and wins over the next-themes light/dark state.
