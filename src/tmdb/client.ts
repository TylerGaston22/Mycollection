/**
 * TMDB client – search movies and TV shows, build poster URLs.
 * Uses the v4 read access token from VITE_TMDB_TOKEN (set in .env.local).
 * Returns an empty result list (not an error) when the token is missing
 * so the rest of the form keeps working.
 */

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN as string | undefined;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TmdbSearchResult {
  tmdbId: number;
  title: string;
  year: string;
  posterUrl: string;
  overview: string;
}

interface TmdbMovieRaw {
  id: number;
  title: string;
  release_date?: string;
  poster_path: string | null;
  overview: string;
}

interface TmdbTvRaw {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path: string | null;
  overview: string;
}

export function isTmdbConfigured(): boolean {
  return !!TMDB_TOKEN && TMDB_TOKEN !== 'PASTE_YOUR_READ_ACCESS_TOKEN_HERE';
}

function buildPosterUrl(path: string | null, size: 'w92' | 'w154' | 'w342' | 'w500' = 'w500'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}/${path.replace(/^\/+/, '')}`;
}

function extractYear(date?: string): string {
  if (!date) return '';
  return date.slice(0, 4);
}

async function tmdbFetch<T>(path: string): Promise<T | null> {
  if (!isTmdbConfigured()) return null;
  const response = await fetch(`${TMDB_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`TMDB ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json() as Promise<T>;
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await tmdbFetch<{ results: TmdbMovieRaw[] }>(
    `/search/movie?query=${encodeURIComponent(trimmed)}&include_adult=false`
  );
  if (!data) return [];
  return data.results.slice(0, 8).map((movie) => ({
    tmdbId: movie.id,
    title: movie.title,
    year: extractYear(movie.release_date),
    posterUrl: buildPosterUrl(movie.poster_path),
    overview: movie.overview,
  }));
}

export async function searchTvShows(query: string): Promise<TmdbSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await tmdbFetch<{ results: TmdbTvRaw[] }>(
    `/search/tv?query=${encodeURIComponent(trimmed)}&include_adult=false`
  );
  if (!data) return [];
  return data.results.slice(0, 8).map((show) => ({
    tmdbId: show.id,
    title: show.name,
    year: extractYear(show.first_air_date),
    posterUrl: buildPosterUrl(show.poster_path),
    overview: show.overview,
  }));
}

export function searchTmdb(contentType: string, query: string): Promise<TmdbSearchResult[]> {
  if (contentType === 'tv-show') return searchTvShows(query);
  return searchMovies(query);
}
