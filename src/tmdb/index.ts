/**
 * TMDB barrel – all TMDB API + UI lives in this folder so it's easy to
 * find, swap out, or remove. The rest of the app should only import from
 * here, never reach into client.ts directly.
 */

export { TmdbSearchableInput } from "./TmdbSearchableInput";
export { isTmdbConfigured, searchTmdb, searchMovies, searchTvShows } from "./client";
export type { TmdbSearchResult } from "./client";
