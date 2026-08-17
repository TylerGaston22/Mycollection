# utils/

Pure utility functions with no side effects. No state, no hooks — just logic.

| File | Purpose |
|------|---------|
| `supabaseConfig.ts` | Pure check for whether the Supabase env vars are present. `findMissingEnvVars(env)` returns the names of any that are absent, empty, or whitespace-only. Lives here rather than in `lib/supabase.ts` so it's testable without importing that module, which calls `createClient()` at import time |
| `themeConfig.ts` | Defines all color themes (Ghibli, Purple Dream, Ocean Blue, Forest Green, Sunset Orange, Teal Wave, Sakura Pink, Midnight Indigo). Exports `getTheme()`, `colorToRgba()`, `createCustomTheme()`, `registerCustomTheme()`, and `deleteCustomTheme()` |
| `contentHelpers.ts` | Display name helpers used throughout the app: `getContentTypeName()` (e.g. `"tv-show"` → `"TV shows"`), `getSectionDisplayName()`, `getCategoryDisplayName()`, and `getSectionContent()` for filtering movies by active section |
