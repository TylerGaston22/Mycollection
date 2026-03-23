import { useState, useEffect } from 'react';
import { toast } from "sonner@2.0.3";
import { Movie } from '../types/movie';

export function useMovies(currentUserId: string) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`movies-${currentUserId}`);
    setMovies(stored ? (JSON.parse(stored) as Movie[]) : []);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`movies-${currentUserId}`, JSON.stringify(movies));
  }, [movies, currentUserId]);

  const addMovie = (movie: Omit<Movie, 'id'>) => {
    const isDuplicate = movies.some(
      m => m.title.toLowerCase() === movie.title.toLowerCase() && m.type === movie.type
    );
    if (isDuplicate) {
      toast.error('Duplicate item', {
        description: `"${movie.title}" already exists in your collection.`,
      });
      return;
    }
    setMovies(prev => [{ ...movie, id: Date.now().toString() }, ...prev]);
  };

  const updateMovie = (id: string, updates: Partial<Movie>) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMovie = (id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  const removeByType = (type: string) => {
    setMovies(prev => prev.filter(m => m.type !== type));
  };

  const importMovies = (imported: Movie[]) => {
    setMovies(imported);
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
