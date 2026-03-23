import { useState, useEffect } from 'react';
import { toast } from "sonner@2.0.3";
import { Movie } from '../types';

export function useMovies(currentUserId: string) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const savedMoviesJsonString = localStorage.getItem(`movies-${currentUserId}`);
    if (savedMoviesJsonString) {
      setMovies(JSON.parse(savedMoviesJsonString) as Movie[]);
    } else {
      setMovies([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`movies-${currentUserId}`, JSON.stringify(movies));
  }, [movies, currentUserId]);

  const addMovie = (movie: Omit<Movie, 'id'>) => {
    const isDuplicate = movies.some(
      (existingMovie) => existingMovie.title.toLowerCase() === movie.title.toLowerCase() && existingMovie.type === movie.type
    );
    if (isDuplicate) {
      toast.error('Duplicate item', {
        description: `"${movie.title}" already exists in your collection.`,
      });
      return;
    }
    setMovies((previousMoviesList) => [{ ...movie, id: Date.now().toString() }, ...previousMoviesList]);
  };

  const updateMovie = (id: string, updates: Partial<Movie>) => {
    setMovies((previousMoviesList) => previousMoviesList.map((collectionItem) => {
      if (collectionItem.id === id) {
        return { ...collectionItem, ...updates };
      }
      return collectionItem;
    }));
  };

  const deleteMovie = (id: string) => {
    setMovies((previousMoviesList) => previousMoviesList.filter((collectionItem) => collectionItem.id !== id));
  };

  const removeByType = (typeToRemove: string) => {
    setMovies((previousMoviesList) => previousMoviesList.filter((collectionItem) => collectionItem.type !== typeToRemove));
  };

  const importMovies = (importedMoviesArray: Movie[]) => {
    setMovies(importedMoviesArray);
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
