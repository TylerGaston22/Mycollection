/**
 * useItems – CRUD operations for the collection items list.
 * Demo user: persists to localStorage with mock data seed.
 * Supabase user: reads/writes from the collection_items table.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { supabase } from '../lib/supabase';
import { Item } from '../types';
import { mockItems, DEMO_USER_ID, loadDemoData, useDemoSync } from '../demo';
import { STORAGE_KEYS, type ItemStatus } from '../constants';
import { handleSupabaseError } from '../utils/toastError';

// Convert a DB row (snake_case) to a Item object (camelCase)
function rowToItem(row: Record<string, unknown>): Item {
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
    noteImages: (row.note_images as string[]) || undefined,
    platform: (row.platform as string) || undefined,
    studio: (row.studio as string) || undefined,
    genre: (row.genre as string) || undefined,
    seasons: (row.seasons as number) || undefined,
    episodes: (row.episodes as number) || undefined,
    sections: (row.sections as string[]) || undefined,
  };
}

// Convert a Item object to a DB row for insert/update
function itemToRow(item: Partial<Item> & { type?: string }, userId: string): Record<string, unknown> {
  const row: Record<string, unknown> = { user_id: userId };
  if (item.title !== undefined) row.title = item.title;
  if (item.type !== undefined) row.type = item.type;
  if (item.year !== undefined) row.year = item.year || null;
  if (item.posterUrl !== undefined) row.poster_url = item.posterUrl || null;
  if (item.status !== undefined) row.status = item.status;
  if (item.rating !== undefined) row.rating = item.rating || null;
  if (item.favorite !== undefined) row.favorite = item.favorite;
  if (item.notes !== undefined) row.notes = item.notes || null;
  if (item.noteImages !== undefined) row.note_images = item.noteImages || [];
  if (item.platform !== undefined) row.platform = item.platform || null;
  if (item.studio !== undefined) row.studio = item.studio || null;
  if (item.genre !== undefined) row.genre = item.genre || null;
  if (item.seasons !== undefined) row.seasons = item.seasons || null;
  if (item.episodes !== undefined) row.episodes = item.episodes || null;
  if (item.sections !== undefined) row.sections = item.sections || [];
  return row;
}

export function useItems(currentUserId: string, isDemoUser: boolean) {
  const [items, setItems] = useState<Item[]>([]);
  // Tracks which user's data the items array currently reflects. Derived
  // isLoading stays true until the fetch for the current user completes,
  // so callers (App.tsx) can keep the spinner up and avoid flashing the
  // previous user's data.
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const storageKey = STORAGE_KEYS.items(currentUserId);
  const isLoading = !isDemoUser && loadedForUserId !== currentUserId;

  const loadFromSupabase = useCallback(async () => {
    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (handleSupabaseError('Failed to load collection', error)) return;

    setItems((data || []).map(rowToItem));
    setLoadedForUserId(currentUserId);
  }, [currentUserId]);

  // Load on user change
  useEffect(() => {
    if (isDemoUser) {
      // Canonical demo user always sees the seed; switched-to demo profiles use localStorage
      const data = currentUserId === DEMO_USER_ID
        ? mockItems
        : loadDemoData<Item[]>(storageKey, []);
      setItems(data);
      setLoadedForUserId(currentUserId);
    } else {
      // Clear stale items while the Supabase fetch is in flight
      setItems([]);
      loadFromSupabase();
    }
  }, [currentUserId, isDemoUser, storageKey, loadFromSupabase]);

  // Mirror state to localStorage in demo mode
  useDemoSync(storageKey, items, isDemoUser);

  /**
   * Insert an item. Returns true on success, false on failure
   * (duplicate-title bail, Supabase error). Callers awaiting the result
   * can use this to decide whether to close a dialog vs keep it open
   * so the user sees the toast and can correct the input.
   */
  const addItem = async (item: Omit<Item, 'id'>): Promise<boolean> => {
    // Duplicate detection
    const isDuplicate = items.some(
      (existing) => existing.title.toLowerCase() === item.title.toLowerCase() && existing.type === item.type
    );
    if (isDuplicate) {
      toast.error('Duplicate item', {
        description: `"${item.title}" already exists in your collection.`,
      });
      return false;
    }

    if (isDemoUser) {
      setItems((prev) => [{ ...item, id: Date.now().toString() }, ...prev]);
      return true;
    }

    const row = itemToRow(item, currentUserId);
    const { data, error } = await supabase
      .from('collection_items')
      .insert(row)
      .select()
      .single();

    if (handleSupabaseError('Failed to add item', error)) return false;
    setItems((prev) => [rowToItem(data), ...prev]);
    return true;
  };

  /**
   * Update an item. Optimistic — state changes immediately, Supabase
   * runs in the background. Returns true on success, false if the
   * Supabase write failed (in which case state has already been
   * reverted via loadFromSupabase). Demo mode always returns true.
   */
  const updateItem = async (id: string, updates: Partial<Item>): Promise<boolean> => {
    // Optimistic update for both modes
    setItems((prev) => prev.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));

    if (isDemoUser) return true;

    const row = itemToRow(updates, currentUserId);
    delete row.user_id; // Don't update user_id
    const { error } = await supabase
      .from('collection_items')
      .update(row)
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (handleSupabaseError('Failed to update item', error)) {
      loadFromSupabase(); // Revert on failure
      return false;
    }
    return true;
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    if (!isDemoUser) {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (handleSupabaseError('Failed to delete item', error)) {
        loadFromSupabase();
      }
    }
  };

  const removeByType = async (typeToRemove: string) => {
    setItems((prev) => prev.filter((item) => item.type !== typeToRemove));

    if (!isDemoUser) {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('user_id', currentUserId)
        .eq('type', typeToRemove);

      if (handleSupabaseError('Failed to remove items', error)) {
        loadFromSupabase();
      }
    }
  };

  const importItems = async (importedMovies: Item[]) => {
    if (isDemoUser) {
      setItems(importedMovies);
    } else {
      // For Supabase users: delete all existing, insert new.
      // Explicit user_id filter is defence-in-depth — RLS would also scope this,
      // but a misconfigured policy would otherwise wipe other users' data.
      const { error: deleteError } = await supabase
        .from('collection_items')
        .delete()
        .eq('user_id', currentUserId);

      if (handleSupabaseError('Import failed', deleteError)) return;

      const rows = importedMovies.map((item) => itemToRow(item, currentUserId));

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from('collection_items')
          .insert(rows);

        if (handleSupabaseError('Import failed', insertError)) return;
      }

      loadFromSupabase();
    }
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    removeByType,
    importItems,
    isLoading,
  };
}
