export interface Movie {
  id: string;
  title: string;
  type: string; // 'movie' | 'tv-show' | 'restaurant' | 'place' or custom tab id
  year?: string;
  posterUrl?: string;
  status: 'watched' | 'want-to-see';
  rating?: number;
  favorite: boolean;
  notes?: string;
platform?: string;
  studio?: string;
  genre?: string;
  seasons?: number;
  episodes?: number;
  sections?: string[]; // Custom section IDs this item belongs to
}