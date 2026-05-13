/**
 * useMovies – CRUD operations for the collection items list.
 * Demo user: persists to localStorage with mock data seed.
 * Supabase user: reads/writes from the collection_items table.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner@2.0.3";
import { supabase } from '../lib/supabase';
import { Movie } from '../types';
import { mockItems, DEMO_USER_ID, loadDemoData, useDemoSync } from '../demo';
import { STORAGE_KEYS, type ItemStatus } from '../constants';

// Convert a DB row (snake_case) to a Movie object (camelCase)
function rowToMovie(row: Record<string, unknown>): Movie {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as string,
    year: (row.year as string) || undefined,
    posterUrl: (row.poster_url as string) || undefined,
    status: row.status as ItemStatus,
    rating: (row.rating as number) || undefined,
    favorite: row.favorite as boolean,
    notes: (row.notes as string) || undefined,
    platform: (row.platform as string) || undefined,
    studio: (row.studio as string) || undefined,
    genre: (row.genre as string) || undefined,
    seasons: (row.seasons as number) || undefined,
    episodes: (row.episodes as number) || undefined,
    sections: (row.sections as string[]) || undefined,
  };
}

// Convert a Movie object to a DB row for insert/update
function movieToRow(movie: Partial<Movie> & { type?: string }, userId: string): Record<string, unknown> {
  const row: Record<string, unknown> = { user_id: userId };
  if (movie.title !== undefined) row.title = movie.title;
  if (movie.type !== undefined) row.type = movie.type;
  if (movie.year !== undefined) row.year = movie.year || null;
  if (movie.posterUrl !== undefined) row.poster_url = movie.posterUrl || null;
  if (movie.status !== undefined) row.status = movie.status;
  if (movie.rating !== undefined) row.rating = movie.rating || null;
  if (movie.favorite !== undefined) row.favorite = movie.favorite;
  if (movie.notes !== undefined) row.notes = movie.notes || null;
  if (movie.platform !== undefined) row.platform = movie.platform || null;
  if (movie.studio !== undefined) row.studio = movie.studio || null;
  if (movie.genre !== undefined) row.genre = movie.genre || null;
  if (movie.seasons !== undefined) row.seasons = movie.seasons || null;
  if (movie.episodes !== undefined) row.episodes = movie.episodes || null;
  if (movie.sections !== undefined) row.sections = movie.sections || [];
  return row;
}

export function useMovies(currentUserId: string, isDemoUser: boolean) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const storageKey = STORAGE_KEYS.movies(currentUserId);

  const loadFromSupabase = useCallback(async () => {
    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load collection', { description: error.message });
      return;
    }

    setMovies((data || []).map(rowToMovie));
  }, [currentUserId]);

  // Load on user change
  useEffect(() => {
    if (isDemoUser) {
      // Canonical demo user always sees the seed; switched-to demo profiles use localStorage
      const data = currentUserId === DEMO_USER_ID
        ? mockItems
        : loadDemoData<Movie[]>(storageKey, []);
      setMovies(data);
    } else {
      loadFromSupabase();
    }
  }, [currentUserId, isDemoUser, storageKey, loadFromSupabase]);

  // Mirror state to localStorage in demo mode
  useDemoSync(storageKey, movies, isDemoUser);

  const addMovie = async (movie: Omit<Movie, 'id'>) => {
    // Duplicate detection
    const isDuplicate = movies.some(
      (existing) => existing.title.toLowerCase() === movie.title.toLowerCase() && existing.type === movie.type
    );
    if (isDuplicate) {
      toast.error('Duplicate item', {
        description: `"${movie.title}" already exists in your collection.`,
      });
      return;
    }

    if (isDemoUser) {
      setMovies((prev) => [{ ...movie, id: Date.now().toString() }, ...prev]);
    } else {
      const row = movieToRow(movie, currentUserId);
      const { data, error } = await supabase
        .from('collection_items')
        .insert(row)
        .select()
        .single();

      if (error) {
        toast.error('Failed to add item', { description: error.message });
        return;
      }
      setMovies((prev) => [rowToMovie(data), ...prev]);
    }
  };

  const updateMovie = async (id: string, updates: Partial<Movie>) => {
    // Optimistic update for both modes
    setMovies((prev) => prev.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));

    if (!isDemoUser) {
      const row = movieToRow(updates, currentUserId);
      delete row.user_id; // Don't update user_id
      const { error } = await supabase
        .from('collection_items')
        .update(row)
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        toast.error('Failed to update item', { description: error.message });
        loadFromSupabase(); // Revert on failure
      }
    }
  };

  const deleteMovie = async (id: string) => {
    setMovies((prev) => prev.filter((item) => item.id !== id));

    if (!isDemoUser) {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        toast.error('Failed to delete item', { description: error.message });
        loadFromSupabase();
      }
    }
  };

  const removeByType = async (typeToRemove: string) => {
    setMovies((prev) => prev.filter((item) => item.type !== typeToRemove));

    if (!isDemoUser) {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('user_id', currentUserId)
        .eq('type', typeToRemove);

      if (error) {
        toast.error('Failed to remove items', { description: error.message });
        loadFromSupabase();
      }
    }
  };

  const importMovies = async (importedMovies: Movie[]) => {
    if (isDemoUser) {
      setMovies(importedMovies);
    } else {
      // For Supabase users: delete all existing, insert new.
      // Explicit user_id filter is defence-in-depth — RLS would also scope this,
      // but a misconfigured policy would otherwise wipe other users' data.
      const { error: deleteError } = await supabase
        .from('collection_items')
        .delete()
        .eq('user_id', currentUserId);

      if (deleteError) {
        toast.error('Import failed', { description: deleteError.message });
        return;
      }

      const rows = importedMovies.map((movie) => movieToRow(movie, currentUserId));

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from('collection_items')
          .insert(rows);

        if (insertError) {
          toast.error('Import failed', { description: insertError.message });
          return;
        }
      }

      loadFromSupabase();
    }
  };

  return {
    movies,
    setMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    removeByType,
    importMovies,
  };
}
