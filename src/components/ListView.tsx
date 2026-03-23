import { useState, useMemo } from "react";
import { Movie } from "../types/movie";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Heart, Star, MoreVertical, Trash2, Eye, Clock, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { MovieFormDialog } from "./MovieFormDialog";
import { QuickEditDialog } from "./QuickEditDialog";

interface ListViewProps {
  movies: Movie[];
  onUpdate: (id: string, updates: Partial<Movie>) => void;
  onDelete: (id: string) => void;
  onMovieClick?: (movie: Movie) => void;
  isDarkMode?: boolean;
}

type SortField = 'favorite' | 'title' | 'platform' | 'genre' | 'rating' | 'status';
type SortOrder = 'asc' | 'desc' | null;

export function ListView({ movies, onUpdate, onDelete, onMovieClick, isDarkMode }: ListViewProps) {
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  
  // Quick edit states
  const [quickEditMovie, setQuickEditMovie] = useState<Movie | null>(null);
  const [quickEditField, setQuickEditField] = useState<'platform' | 'genre' | 'notes' | null>(null);

  const toggleFavorite = (movie: Movie) => {
    onUpdate(movie.id, { favorite: !movie.favorite });
  };

  const toggleStatus = (movie: Movie) => {
    const newStatus = movie.status === 'watched' ? 'want-to-see' : 'watched';
    onUpdate(movie.id, { status: newStatus });
  };

  const setRating = (movie: Movie, rating: number) => {
    onUpdate(movie.id, { rating: movie.rating === rating ? undefined : rating });
  };

  const openQuickEdit = (movie: Movie, field: 'platform' | 'genre' | 'notes') => {
    setQuickEditMovie(movie);
    setQuickEditField(field);
  };
  
  const handleQuickEditSave = (value: string) => {
    if (quickEditMovie && quickEditField) {
      onUpdate(quickEditMovie.id, { [quickEditField]: value || undefined });
    }
    setQuickEditMovie(null);
    setQuickEditField(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedMovies = useMemo(() => {
    if (!sortField || !sortOrder) return movies;

    const sorted = [...movies].sort((a, b) => {
      switch (sortField) {
        case 'favorite':
          // Favorites at top when ascending
          if (a.favorite === b.favorite) return 0;
          return sortOrder === 'asc' 
            ? (a.favorite ? -1 : 1)
            : (a.favorite ? 1 : -1);
        
        case 'title':
          const titleCompare = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? titleCompare : -titleCompare;
        
        case 'platform':
          const platformA = a.platform || '';
          const platformB = b.platform || '';
          const platformCompare = platformA.localeCompare(platformB);
          return sortOrder === 'asc' ? platformCompare : -platformCompare;
        
        case 'genre':
          const genreA = a.genre || '';
          const genreB = b.genre || '';
          const genreCompare = genreA.localeCompare(genreB);
          return sortOrder === 'asc' ? genreCompare : -genreCompare;
        
        case 'rating':
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          // Highest rating first when ascending
          return sortOrder === 'asc' 
            ? ratingB - ratingA
            : ratingA - ratingB;
        
        case 'status':
          const statusA = a.status === 'watched' ? 1 : 0;
          const statusB = b.status === 'watched' ? 1 : 0;
          return sortOrder === 'asc' 
            ? statusB - statusA
            : statusA - statusB;
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [movies, sortField, sortOrder]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`w-[50px] ${isDarkMode ? 'text-white' : ''}`}>
              <button
                onClick={() => handleSort('favorite')}
                className={`flex items-center transition-colors ${isDarkMode ? 'hover:text-orange-300' : 'hover:text-foreground'}`}
              >
                Favorite
                {getSortIcon('favorite')}
              </button>
            </TableHead>
            <TableHead className={isDarkMode ? 'text-white' : ''}>
              <button
                onClick={() => handleSort('title')}
                className={`flex items-center transition-colors ${isDarkMode ? 'hover:text-orange-300' : 'hover:text-foreground'}`}
              >
                Title
                {getSortIcon('title')}
              </button>
            </TableHead>
            <TableHead className={isDarkMode ? 'text-white' : ''}>
              <button
                onClick={() => handleSort('platform')}
                className={`flex items-center transition-colors ${isDarkMode ? 'hover:text-orange-300' : 'hover:text-foreground'}`}
              >
                Where to Watch
                {getSortIcon('platform')}
              </button>
            </TableHead>
            <TableHead className={isDarkMode ? 'text-white' : ''}>
              <button
                onClick={() => handleSort('genre')}
                className={`flex items-center transition-colors ${isDarkMode ? 'hover:text-orange-300' : 'hover:text-foreground'}`}
              >
                Genre
                {getSortIcon('genre')}
              </button>
            </TableHead>
            <TableHead className={isDarkMode ? 'text-white' : ''}>
              <button
                onClick={() => handleSort('status')}
                className={`flex items-center transition-colors ${isDarkMode ? 'hover:text-orange-300' : 'hover:text-foreground'}`}
              >
                Status
                {getSortIcon('status')}
              </button>
            </TableHead>
            <TableHead className={isDarkMode ? 'text-white' : ''}>
              <button
                onClick={() => handleSort('rating')}
                className={`flex items-center transition-colors ${isDarkMode ? 'hover:text-orange-300' : 'hover:text-foreground'}`}
              >
                Rating
                {getSortIcon('rating')}
              </button>
            </TableHead>
            <TableHead className={`max-w-[300px] ${isDarkMode ? 'text-white' : ''}`}>Notes</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMovies.map((movie) => (
            <TableRow 
              key={movie.id}
              className="hover:bg-muted/50"
            >
              <TableCell>
                <button
                  onClick={() => toggleFavorite(movie)}
                  className="hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      movie.favorite ? 'fill-red-500 text-red-500' : 'text-white stroke-white stroke-2'
                    }`}
                  />
                </button>
              </TableCell>
              <TableCell className={isDarkMode ? 'text-white' : ''}>
                <button
                  onClick={() => onMovieClick?.(movie)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onMovieClick?.(movie);
                  }}
                  className="hover:opacity-70 transition-opacity cursor-pointer text-left"
                >
                  {movie.title}
                </button>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => openQuickEdit(movie, 'platform')}
                  className="hover:opacity-70 transition-opacity"
                >
                  {movie.platform ? (
                    <Badge variant="outline" className={`cursor-pointer ${isDarkMode ? 'text-white border-white/30' : ''}`}>
                      {movie.platform}
                    </Badge>
                  ) : (
                    <span className={`cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>-</span>
                  )}
                </button>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => openQuickEdit(movie, 'genre')}
                  className="hover:opacity-70 transition-opacity"
                >
                  {movie.genre ? (
                    <Badge variant="secondary" className={`cursor-pointer ${isDarkMode ? 'text-white bg-white/10' : ''}`}>
                      {movie.genre}
                    </Badge>
                  ) : (
                    <span className={`cursor-pointer ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>-</span>
                  )}
                </button>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => toggleStatus(movie)}
                  className="hover:opacity-80 transition-opacity"
                >
                  <Badge 
                    variant={movie.status === 'watched' ? 'default' : 'secondary'}
                    className={`cursor-pointer ${isDarkMode ? 'text-white border-white/30 bg-transparent' : ''}`}
                  >
                    {movie.status === 'watched' ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        {movie.type === 'movie' || movie.type === 'tv-show' ? 'Watched' : 'Visited'}
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        {movie.type === 'movie' || movie.type === 'tv-show' ? 'Want to See' : 'Want to Visit'}
                      </>
                    )}
                  </Badge>
                </button>
              </TableCell>
              <TableCell>
                {movie.status === 'watched' && (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(movie, star)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            movie.rating && star <= movie.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground/40'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[300px]">
                <button
                  onClick={() => openQuickEdit(movie, 'notes')}
                  className="hover:opacity-70 transition-opacity w-full text-left"
                >
                  <p className="truncate text-muted-foreground cursor-pointer">
                    {movie.notes || '-'}
                  </p>
                </button>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setEditingMovie(movie);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(movie);
                    }}>
                      {movie.status === 'watched' ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as {movie.type === 'movie' || movie.type === 'tv-show' ? 'Want to See' : 'Want to Visit'}
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Mark as {movie.type === 'movie' || movie.type === 'tv-show' ? 'Watched' : 'Visited'}
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(movie.id);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MovieFormDialog
        movie={editingMovie}
        open={!!editingMovie}
        onOpenChange={(open) => !open && setEditingMovie(null)}
        onUpdate={onUpdate}
      />
      
      {quickEditMovie && quickEditField && (
        <QuickEditDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setQuickEditMovie(null);
              setQuickEditField(null);
            }
          }}
          title={`Edit ${quickEditField === 'platform' ? 'Where to Watch' : quickEditField === 'genre' ? 'Genre' : 'Notes'}`}
          fieldName={quickEditField === 'platform' ? 'Platform' : quickEditField === 'genre' ? 'Genre' : 'Notes'}
          value={quickEditField === 'notes' ? (quickEditMovie.notes || '') : quickEditField === 'platform' ? (quickEditMovie.platform || '') : (quickEditMovie.genre || '')}
          onSave={handleQuickEditSave}
          type={quickEditField === 'notes' ? 'textarea' : 'input'}
          placeholder={
            quickEditField === 'platform' ? 'e.g., Netflix, Hulu, Disney+' :
            quickEditField === 'genre' ? 'e.g., Action, Comedy, Drama' :
            'Add your notes here...'
          }
        />
      )}
    </div>
  );
}