# src/

Root source directory for the Mycollection app — a personal tracker for movies, TV shows, restaurants, and places.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `assets/` | Static image files referenced in the app |
| `components/` | React UI components (dialogs, cards, layout, views) |
| `hooks/` | Custom React hooks for state and localStorage logic |
| `mock/` | All demo/seed data used to populate a new user's collection |
| `styles/` | CSS files — Tailwind output and global design tokens |
| `types/` | TypeScript interfaces shared across the app |
| `utils/` | Pure helper functions and theme configuration |
| `guidelines/` | AI and design system guidelines for this project |

## Root Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component — orchestrates all hooks, manages UI state, renders dialogs and layout |
| `main.tsx` | React entry point — mounts the app and imports global CSS |
