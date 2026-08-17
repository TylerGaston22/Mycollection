# components/

All React components for the app. Organized into three groups: app-level components here, Figma-specific helpers in `figma/`, and Radix UI primitives in `ui/`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `figma/` | Utility components specific to the Figma Make environment |
| `ui/` | Radix UI + Tailwind component primitives (buttons, dialogs, inputs, etc.) |

## Layout & Pages

| File | Purpose |
|------|---------|
| `SidebarLayout.tsx` | Main app shell — fixed left sidebar with category navigation, subcategories, and user actions; right main content area with header and item grid/list |
| `SupabaseConfigBanner.tsx` | Fixed red top banner shown when the Supabase env vars are missing. Renders `null` when configured, so App mounts it unconditionally. Non-dismissible by design — an unconfigured app silently no-ops every write |
| `LandingPage.tsx` | Welcome screen shown on every page load before the user signs in |
| `SignInPage.tsx` | Sign-in form (username + password). Currently accepts any input and signs the user in |

## Content Views

| File | Purpose |
|------|---------|
| `MovieCard.tsx` | Grid view card for a single collection item — shows title, genre, status badge, rating, favorite toggle, and action menu |
| `ListView.tsx` | Table/row view for collection items — more compact than grid, shows all fields in columns |

## Dialogs — Collection Management

| File | Purpose |
|------|---------|
| `AddMovieDialog.tsx` | Dialog to add a new item to the collection. Fields adapt based on the active content type (movie vs restaurant vs place, etc.) |
| `EditMovieDialog.tsx` | Dialog to edit an existing item's fields |
| `MovieDetailDialog.tsx` | Full detail view for a single item — shows all fields, notes, sections, and allows inline editing |
| `QuickEditDialog.tsx` | Lightweight inline edit dialog for quickly updating a single field without opening the full edit dialog |

## Dialogs — Organization

| File | Purpose |
|------|---------|
| `AddTabDialog.tsx` | Dialog to create a new custom category tab with a name and icon |
| `AddSectionDialog.tsx` | Dialog to create a new subcategory within the current tab |

## Dialogs — User & Settings

| File | Purpose |
|------|---------|
| `ProfileDialog.tsx` | Displays the current user's profile stats and allows data export |
| `ProfileSwitcherDialog.tsx` | Lists available user profiles and allows switching between them |
| `SettingsDialog.tsx` | App settings — data import/export and per-category background color theme selection |
| `ShareDialog.tsx` | Generates a shareable text/link for the current section's item list |
| `CustomColorPickerDialog.tsx` | Color picker for creating a custom background theme for a category |
| `FormatGuideDialog.tsx` | Help dialog explaining how to format notes and other text fields |
