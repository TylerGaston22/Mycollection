/**
 * useCustomTabs & useCustomSections – manage user-created categories and sub-sections.
 * Demo user: localStorage persistence.
 * Supabase user: database persistence with optimistic updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CustomTab, CustomSection } from '../types';
import { loadDemoData, useDemoSync } from '../demo';
import { STORAGE_KEYS } from '../constants';
import { handleSupabaseError } from '../utils/toastError';

export function useCustomTabs(currentUserId: string, isDemoUser: boolean) {
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const storageKey = STORAGE_KEYS.customTabs(currentUserId);
  const isLoading = !isDemoUser && loadedForUserId !== currentUserId;

  const loadTabs = useCallback(async () => {
    const { data, error } = await supabase
      .from('custom_tabs')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: true });

    if (handleSupabaseError('Failed to load tabs', error)) return;

    setCustomTabs((data || []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
    })));
    setLoadedForUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    if (isDemoUser) {
      setCustomTabs(loadDemoData<CustomTab[]>(storageKey, []));
      setLoadedForUserId(currentUserId);
    } else {
      setCustomTabs([]);
      loadTabs();
    }
  }, [currentUserId, isDemoUser, storageKey, loadTabs]);

  useDemoSync(storageKey, customTabs, isDemoUser);

  /**
   * Insert a new custom tab. Returns the created CustomTab on success
   * or null on failure. Returning null lets the caller (App.tsx) avoid
   * the "switch contentType to a phantom id that doesn't exist in
   * customTabs" bug — the previous implementation returned a fake
   * fallback tab with a `temp-…` id that wasn't actually in the list.
   */
  const addCustomTab = async (tab: Omit<CustomTab, 'id'>): Promise<CustomTab | null> => {
    if (isDemoUser) {
      const newTab: CustomTab = { ...tab, id: `custom-${Date.now()}` };
      setCustomTabs((prev) => [...prev, newTab]);
      return newTab;
    }

    const { data, error } = await supabase
      .from('custom_tabs')
      .insert({ name: tab.name, icon: tab.icon, user_id: currentUserId })
      .select()
      .single();

    if (handleSupabaseError('Failed to create tab', error)) {
      return null;
    }

    const newTab: CustomTab = { id: data.id, name: data.name, icon: data.icon };
    setCustomTabs((prev) => [...prev, newTab]);
    return newTab;
  };

  const removeTab = async (tabId: string) => {
    setCustomTabs((prev) => prev.filter((tab) => tab.id !== tabId));

    if (!isDemoUser) {
      const { error } = await supabase
        .from('custom_tabs')
        .delete()
        .eq('id', tabId)
        .eq('user_id', currentUserId);

      if (handleSupabaseError('Failed to delete tab', error)) {
        loadTabs();
      }
    }
  };

  return { customTabs, setCustomTabs, addCustomTab, removeTab, isLoading };
}

export function useCustomSections(currentUserId: string, isDemoUser: boolean) {
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const storageKey = STORAGE_KEYS.customSections(currentUserId);
  const isLoading = !isDemoUser && loadedForUserId !== currentUserId;

  const loadSections = useCallback(async () => {
    const { data, error } = await supabase
      .from('custom_sections')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: true });

    if (handleSupabaseError('Failed to load sections', error)) return;

    setCustomSections((data || []).map((row) => ({
      id: row.id,
      name: row.name,
      contentType: row.content_type,
    })));
    setLoadedForUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    if (isDemoUser) {
      setCustomSections(loadDemoData<CustomSection[]>(storageKey, []));
      setLoadedForUserId(currentUserId);
    } else {
      setCustomSections([]);
      loadSections();
    }
  }, [currentUserId, isDemoUser, storageKey, loadSections]);

  useDemoSync(storageKey, customSections, isDemoUser);

  const addCustomSection = async (section: Omit<CustomSection, 'id'>): Promise<CustomSection> => {
    if (isDemoUser) {
      const newSection: CustomSection = { ...section, id: `section-${Date.now()}` };
      setCustomSections((prev) => [...prev, newSection]);
      return newSection;
    }

    const { data, error } = await supabase
      .from('custom_sections')
      .insert({ name: section.name, content_type: section.contentType, user_id: currentUserId })
      .select()
      .single();

    if (handleSupabaseError('Failed to create section', error)) {
      const fallback: CustomSection = { ...section, id: `temp-${Date.now()}` };
      return fallback;
    }

    const newSection: CustomSection = { id: data.id, name: data.name, contentType: data.content_type };
    setCustomSections((prev) => [...prev, newSection]);
    return newSection;
  };

  const removeByContentType = async (contentType: string) => {
    setCustomSections((prev) => prev.filter((s) => s.contentType !== contentType));

    if (!isDemoUser) {
      const { error } = await supabase
        .from('custom_sections')
        .delete()
        .eq('user_id', currentUserId)
        .eq('content_type', contentType);

      if (handleSupabaseError('Failed to remove sections', error)) {
        loadSections();
      }
    }
  };

  return { customSections, setCustomSections, addCustomSection, removeByContentType, isLoading };
}
