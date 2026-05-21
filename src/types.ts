/**
 * Core type definitions for the collection management app.
 * These interfaces are shared across all components, hooks, and utilities.
 */

import type { ItemStatus } from './constants';

export type ListVisibility = 'private' | 'friends';

export interface Item {
  id: string;
  title: string;
  type: string; // built-in content type or custom tab id — see CONTENT_TYPES
  year?: string;
  posterUrl?: string;
  status: ItemStatus;
  rating?: number;
  favorite: boolean;
  notes?: string;
  platform?: string;
  studio?: string;
  genre?: string;
  seasons?: number;
  episodes?: number;
  sections?: string[]; // custom section IDs this item belongs to
}

export interface CustomTab {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
}

export interface CustomSection {
  id: string;
  name: string;
  contentType: string; // which content type this section belongs to
}

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  profileImage?: string;
  email: string;
  joinDate: string;
  listVisibility: ListVisibility;
}
