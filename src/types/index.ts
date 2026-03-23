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
}
