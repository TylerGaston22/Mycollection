import { useState, useMemo, useEffect } from "react";
import { Movie } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Heart, Star, MoreVertical, Trash2, Eye, Clock, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { MovieFormDialog } from "./MovieFormDialog";

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
  const [movieBeingEdited, setMovieBeingEdited] = useState<Movie | null>(null);
  const [activeSortField, setActiveSortField] = useState<SortField | null>(null);
  const [currentSortOrder, setCurrentSortOrder] = useState<SortOrder>(null);
  const [movieBeingQuickEdited, setMovieBeingQuickEdited] = useState<Movie | null>(null);
  const [fieldBeingQuickEdited, setFieldBeingQuickEdited] = useState<'platform' | 'genre' | 'notes' | null>(null);
  const [currentEditFieldValue, setCurrentEditFieldValue] = useState('');

  useEffect(() => {
    if (movieBeingQuickEdited && fieldBeingQuickEdited) {
      let initialEditFieldValue: string;
      if (fieldBeingQuickEdited === 'notes') {
        initialEditFieldValue = movieBeingQuickEdited.notes || '';
      } else if (fieldBeingQuickEdited === 'platform') {
        initialEditFieldValue = movieBeingQuickEdited.platform || '';
      } else {
        initialEditFieldValue = movieBeingQuickEdited.genre || '';
      }
      setCurrentEditFieldValue(initialEditFieldValue);
    }
  }, [movieBeingQuickEdited, fieldBeingQuickEdited]);

  const toggleFavorite = (movie: Movie) => onUpdate(movie.id, { favorite: !movie.favorite });

  const toggleStatus = (movie: Movie) => {
    let updatedItemStatus: 'watched' | 'want-to-see';
    if (movie.status === 'watched') {
      updatedItemStatus = 'want-to-see';
    } else {
      updatedItemStatus = 'watched';
    }
    onUpdate(movie.id, { status: updatedItemStatus });
  };

  const setRating = (movie: Movie, starRatingNumber: number) => {
    let newRatingValue: number | undefined;
    if (movie.rating === starRatingNumber) {
      newRatingValue = undefined;
    } else {
      newRatingValue = starRatingNumber;
    }
    onUpdate(movie.id, { rating: newRatingValue });
  };

  const openQuickEdit = (movie: Movie, field: 'platform' | 'genre' | 'notes') => {
    setMovieBeingQuickEdited(movie);
    setFieldBeingQuickEdited(field);
  };

  const closeQuickEdit = () => {
    setMovieBeingQuickEdited(null);
    setFieldBeingQuickEdited(null);
  };

  const handleQuickEditSave = () => {
    if (movieBeingQuickEdited && fieldBeingQuickEdited) {
      onUpdate(movieBeingQuickEdited.id, { [fieldBeingQuickEdited]: currentEditFieldValue || undefined });
    }
    closeQuickEdit();
  };

  const handleSort = (fieldToSortBy: SortField) => {
    if (activeSortField === fieldToSortBy) {
      if (currentSortOrder === 'asc') {
        setCurrentSortOrder('desc');
      } else {
        setCurrentSortOrder(null);
        setActiveSortField(null);
      }
    } else {
      setActiveSortField(fieldToSortBy);
      setCurrentSortOrder('asc');
    }
  };

  const sortedMovies = useMemo(() => {
    if (!activeSortField || !currentSortOrder) return movies;
    return [...movies].sort((firstMovie, secondMovie) => {
      switch (activeSortField) {
        case 'favorite': {
          if (firstMovie.favorite === secondMovie.favorite) {
            return 0;
          }
          if (currentSortOrder === 'asc') {
            if (firstMovie.favorite) {
              return -1;
            }
            return 1;
          }
          if (firstMovie.favorite) {
            return 1;
          }
          return -1;
        }
        case 'title': {
          const alphabeticalComparisonResult = firstMovie.title.localeCompare(secondMovie.title);
          if (currentSortOrder === 'asc') {
            return alphabeticalComparisonResult;
          }
          return -alphabeticalComparisonResult;
        }
        case 'platform': {
          const alphabeticalComparisonResult = (firstMovie.platform || '').localeCompare(secondMovie.platform || '');
          if (currentSortOrder === 'asc') {
            return alphabeticalComparisonResult;
          }
          return -alphabeticalComparisonResult;
        }
        case 'genre': {
          const alphabeticalComparisonResult = (firstMovie.genre || '').localeCompare(secondMovie.genre || '');
          if (currentSortOrder === 'asc') {
            return alphabeticalComparisonResult;
          }
          return -alphabeticalComparisonResult;
        }
        case 'rating': {
          const firstMovieRating = firstMovie.rating || 0;
          const secondMovieRating = secondMovie.rating || 0;
          if (currentSortOrder === 'asc') {
            return secondMovieRating - firstMovieRating;
          }
          return firstMovieRating - secondMovieRating;
        }
        case 'status': {
          let firstMovieStatusRank = 0;
          if (firstMovie.status === 'watched') {
            firstMovieStatusRank = 1;
          }
          let secondMovieStatusRank = 0;
          if (secondMovie.status === 'watched') {
            secondMovieStatusRank = 1;
          }
          if (currentSortOrder === 'asc') {
            return secondMovieStatusRank - firstMovieStatusRank;
          }
          return firstMovieStatusRank - secondMovieStatusRank;
        }
        default:
          return 0;
      }
    });
  }, [movies, activeSortField, currentSortOrder]);

  const getSortDirectionIcon = (fieldToCheck: SortField) => {
    if (activeSortField !== fieldToCheck) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    }
    if (currentSortOrder === 'asc') {
      return <ArrowUp className="h-3 w-3 ml-1" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  let tableHeaderHoverColorClass;
  if (isDarkMode) {
    tableHeaderHoverColorClass = 'hover:text-orange-300';
  } else {
    tableHeaderHoverColorClass = 'hover:text-foreground';
  }

  let tableTextColorClass = '';
  if (isDarkMode) {
    tableTextColorClass = 'text-white';
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center transition-colors ${tableHeaderHoverColorClass}`}
    >
      {label}{getSortDirectionIcon(field)}
    </button>
  );

  let quickEditDialogTitle = '';
  if (fieldBeingQuickEdited === 'platform') {
    quickEditDialogTitle = 'Edit Where to Watch';
  } else if (fieldBeingQuickEdited === 'genre') {
    quickEditDialogTitle = 'Edit Genre';
  } else if (fieldBeingQuickEdited === 'notes') {
    quickEditDialogTitle = 'Edit Notes';
  }

  let quickEditFieldLabel = '';
  if (fieldBeingQuickEdited === 'platform') {
    quickEditFieldLabel = 'Platform';
  } else if (fieldBeingQuickEdited === 'genre') {
    quickEditFieldLabel = 'Genre';
  } else if (fieldBeingQuickEdited === 'notes') {
    quickEditFieldLabel = 'Notes';
  }

  let quickEditInputPlaceholder = '';
  if (fieldBeingQuickEdited === 'platform') {
    quickEditInputPlaceholder = 'e.g., Netflix, Hulu, Disney+';
  } else if (fieldBeingQuickEdited === 'genre') {
    quickEditInputPlaceholder = 'e.g., Action, Comedy, Drama';
  }

  let quickEditInputComponent = null;
  if (fieldBeingQuickEdited === 'notes') {
    quickEditInputComponent = (
      <Textarea
        id="qe-field"
        value={currentEditFieldValue}
        onChange={(event) => setCurrentEditFieldValue(event.target.value)}
        placeholder="Add your notes here..."
        rows={4}
        autoFocus
      />
    );
  } else if (fieldBeingQuickEdited) {
    quickEditInputComponent = (
      <Input
        id="qe-field"
        value={currentEditFieldValue}
        onChange={(event) => setCurrentEditFieldValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleQuickEditSave();
          }
        }}
        placeholder={quickEditInputPlaceholder}
        autoFocus
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={`w-[50px] ${tableTextColorClass}`}>
              <SortButton field="favorite" label="Favorite" />
            </TableHead>
            <TableHead className={tableTextColorClass}>
              <SortButton field="title" label="Title" />
            </TableHead>
            <TableHead className={tableTextColorClass}>
              <SortButton field="platform" label="Where to Watch" />
            </TableHead>
            <TableHead className={tableTextColorClass}>
              <SortButton field="genre" label="Genre" />
            </TableHead>
            <TableHead className={tableTextColorClass}>
              <SortButton field="status" label="Status" />
            </TableHead>
            <TableHead className={tableTextColorClass}>
              <SortButton field="rating" label="Rating" />
            </TableHead>
            <TableHead className={`max-w-[300px] ${tableTextColorClass}`}>Notes</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMovies.map((movie) => {
            const isMediaContentType = movie.type === 'movie' || movie.type === 'tv-show';

            let heartIconColorClass;
            if (movie.favorite) {
              heartIconColorClass = 'fill-red-500 text-red-500';
            } else {
              heartIconColorClass = 'text-white stroke-white stroke-2';
            }

            let platformCellContent;
            if (movie.platform) {
              let platformBadgeClassName = 'cursor-pointer';
              if (isDarkMode) {
                platformBadgeClassName += ' text-white border-white/30';
              }
              platformCellContent = <Badge variant="outline" className={platformBadgeClassName}>{movie.platform}</Badge>;
            } else {
              let platformEmptySpanClassName = 'cursor-pointer ';
              if (isDarkMode) {
                platformEmptySpanClassName += 'text-gray-400';
              } else {
                platformEmptySpanClassName += 'text-muted-foreground';
              }
              platformCellContent = <span className={platformEmptySpanClassName}>-</span>;
            }

            let genreCellContent;
            if (movie.genre) {
              let genreBadgeClassName = 'cursor-pointer';
              if (isDarkMode) {
                genreBadgeClassName += ' text-white bg-white/10';
              }
              genreCellContent = <Badge variant="secondary" className={genreBadgeClassName}>{movie.genre}</Badge>;
            } else {
              let genreEmptySpanClassName = 'cursor-pointer ';
              if (isDarkMode) {
                genreEmptySpanClassName += 'text-gray-400';
              } else {
                genreEmptySpanClassName += 'text-muted-foreground';
              }
              genreCellContent = <span className={genreEmptySpanClassName}>-</span>;
            }

            let statusBadgeVariant: 'default' | 'secondary';
            if (movie.status === 'watched') {
              statusBadgeVariant = 'default';
            } else {
              statusBadgeVariant = 'secondary';
            }

            let statusBadgeClassName = 'cursor-pointer';
            if (isDarkMode) {
              statusBadgeClassName += ' text-white border-white/30 bg-transparent';
            }

            let watchedStatusLabel;
            if (isMediaContentType) {
              watchedStatusLabel = 'Watched';
            } else {
              watchedStatusLabel = 'Visited';
            }

            let wantToSeeStatusLabel;
            if (isMediaContentType) {
              wantToSeeStatusLabel = 'Want to See';
            } else {
              wantToSeeStatusLabel = 'Want to Visit';
            }

            let statusBadgeContent;
            if (movie.status === 'watched') {
              statusBadgeContent = (
                <><Eye className="h-3 w-3 mr-1" />{watchedStatusLabel}</>
              );
            } else {
              statusBadgeContent = (
                <><Clock className="h-3 w-3 mr-1" />{wantToSeeStatusLabel}</>
              );
            }

            let dropdownStatusMenuItemContent;
            if (movie.status === 'watched') {
              let markAsLabel;
              if (isMediaContentType) {
                markAsLabel = 'Want to See';
              } else {
                markAsLabel = 'Want to Visit';
              }
              dropdownStatusMenuItemContent = (
                <><Clock className="h-4 w-4 mr-2" />Mark as {markAsLabel}</>
              );
            } else {
              let markAsLabel;
              if (isMediaContentType) {
                markAsLabel = 'Watched';
              } else {
                markAsLabel = 'Visited';
              }
              dropdownStatusMenuItemContent = (
                <><Eye className="h-4 w-4 mr-2" />Mark as {markAsLabel}</>
              );
            }

            return (
              <TableRow key={movie.id} className="hover:bg-muted/50">
                <TableCell>
                  <button onClick={() => toggleFavorite(movie)} className="hover:scale-110 transition-transform">
                    <Heart className={`h-5 w-5 ${heartIconColorClass}`} />
                  </button>
                </TableCell>
                <TableCell className={tableTextColorClass}>
                  <button
                    onClick={() => onMovieClick?.(movie)}
                    onContextMenu={(event) => { event.preventDefault(); onMovieClick?.(movie); }}
                    className="hover:opacity-70 transition-opacity cursor-pointer text-left"
                  >
                    {movie.title}
                  </button>
                </TableCell>
                <TableCell>
                  <button onClick={() => openQuickEdit(movie, 'platform')} className="hover:opacity-70 transition-opacity">
                    {platformCellContent}
                  </button>
                </TableCell>
                <TableCell>
                  <button onClick={() => openQuickEdit(movie, 'genre')} className="hover:opacity-70 transition-opacity">
                    {genreCellContent}
                  </button>
                </TableCell>
                <TableCell>
                  <button onClick={() => toggleStatus(movie)} className="hover:opacity-80 transition-opacity">
                    <Badge variant={statusBadgeVariant} className={statusBadgeClassName}>
                      {statusBadgeContent}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  {movie.status === 'watched' && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starRatingNumber) => {
                        let starIconColorClass;
                        if (movie.rating && starRatingNumber <= movie.rating) {
                          starIconColorClass = 'fill-yellow-500 text-yellow-500';
                        } else {
                          starIconColorClass = 'text-muted-foreground/40';
                        }
                        return (
                          <button key={starRatingNumber} onClick={() => setRating(movie, starRatingNumber)} className="hover:scale-110 transition-transform">
                            <Star className={`h-4 w-4 ${starIconColorClass}`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <button onClick={() => openQuickEdit(movie, 'notes')} className="hover:opacity-70 transition-opacity w-full text-left">
                    <p className="truncate text-muted-foreground cursor-pointer">{movie.notes || '-'}</p>
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
                      <DropdownMenuItem onClick={(event: React.MouseEvent) => { event.stopPropagation(); setMovieBeingEdited(movie); }}>
                        <Edit className="mr-2 h-4 w-4" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(event: React.MouseEvent) => { event.stopPropagation(); toggleStatus(movie); }}>
                        {dropdownStatusMenuItemContent}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(event: React.MouseEvent) => { event.stopPropagation(); onDelete(movie.id); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <MovieFormDialog
        movie={movieBeingEdited}
        open={!!movieBeingEdited}
        onOpenChange={(isOpen: boolean) => { if (!isOpen) setMovieBeingEdited(null); }}
        onUpdate={onUpdate}
      />

      {/* Quick Edit Dialog */}
      {movieBeingQuickEdited && fieldBeingQuickEdited && (
        <Dialog open={true} onOpenChange={(isOpen: boolean) => { if (!isOpen) closeQuickEdit(); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {quickEditDialogTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="qe-field">
                {quickEditFieldLabel}
              </Label>
              {quickEditInputComponent}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeQuickEdit}>Cancel</Button>
              <Button onClick={handleQuickEditSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
