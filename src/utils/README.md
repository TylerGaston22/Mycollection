# utils/

Pure utility functions with no side effects. No state, no hooks — just logic.

| File | Purpose |
|------|---------|
| `tabIcons.ts` | Custom-tab icon registry. `TAB_ICONS` is the picker list; `getTabIcon(name)` maps a name stored in `custom_tabs.icon` to its Lucide component, falling back to `Star`. Single source of truth shared by AddTabDialog, Sidebar, and MobileBottomNav — previously the list was private to the dialog and both nav surfaces just hardcoded `Star` |
| `supabaseConfig.ts` | Pure check for whether the Supabase env vars are present. `findMissingEnvVars(env)` returns the names of any that are absent, empty, or whitespace-only. Lives here rather than in `lib/supabase.ts` so it's testable without importing that module, which calls `createClient()` at import time |
| `themeConfig.ts` | Defines all color themes (Ghibli, Purple Dream, Ocean Blue, Forest Green, Sunset Orange, Teal Wave, Sakura Pink, Midnight Indigo). Exports `getTheme()`, `colorToRgba()`, `createCustomTheme()`, `registerCustomTheme()`, and `deleteCustomTheme()` |
| `contentHelpers.ts` | Display name helpers used throughout the app: `getContentTypeName()` (e.g. `"tv-show"` → `"TV shows"`), `getSectionDisplayName()`, `getCategoryDisplayName()`, and `getSectionContent()` for filtering movies by active section |
