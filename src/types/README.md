# types/

TypeScript interfaces shared across the app. One file per domain concept.

| File | Purpose |
|------|---------|
| `movie.ts` | `Movie` interface — the core data shape for every item in the collection (movies, shows, restaurants, places, and custom tab items). Fields include `id`, `title`, `type`, `status`, `rating`, `favorite`, `sections`, `platform`, `genre`, `notes`, and more |
| `user.ts` | `User` interface — profile data: `id`, `name`, `username`, `bio`, `location`, `email`, `joinDate`, and optional `profileImage` |
| `customTab.ts` | `CustomTab` interface — a user-created category tab with `id`, `name`, and `icon` (lucide-react icon name) |
| `customSection.ts` | `CustomSection` interface — a user-created subcategory within a tab with `id`, `name`, and `contentType` (the tab it belongs to) |
