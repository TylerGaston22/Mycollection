# hooks/

Custom React hooks that encapsulate state management and localStorage persistence. Each hook owns one domain — `App.tsx` composes them together.

| File | Purpose |
|------|---------|
| `useAuth.ts` | Manages sign-in state, current user ID, and profile switching. Clears auth on every page load so the landing page is always the entry point |
| `useMovies.ts` | Manages the movies array — loads from localStorage, seeds initial demo data on first visit, and exposes CRUD operations (`addMovie`, `updateMovie`, `deleteMovie`, `removeByType`, `importMovies`) |
| `useCustomTabs.ts` | Manages user-created category tabs (e.g. "Books", "Games"). Persists to localStorage keyed by user ID |
| `useCustomSections.ts` | Manages user-created subcategories within a tab (e.g. "Favorites", "To Watch Next"). Persists to localStorage keyed by user ID |
| `usePreferences.ts` | Manages layout mode (`desktop`/`mobile`) and per-category background color themes. Both persist to localStorage |
