import { Movie } from "../types/movie";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, Heart, Trash2, Eye, Clock, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieCardProps {
  movie: Movie;
  onUpdate: (id: string, updates: Partial<Movie>) => void;
  onDelete: (id: string) => void;
}

export function MovieCard({ movie, onUpdate, onDelete }: MovieCardProps) {
  const toggleFavorite = () => {
    onUpdate(movie.id, { favorite: !movie.favorite });
  };

  const toggleStatus = () => {
    const newStatus = movie.status === 'watched' ? 'want-to-see' : 'watched';
    onUpdate(movie.id, { status: newStatus });
  };

  const setRating = (rating: number) => {
    onUpdate(movie.id, { rating: movie.rating === rating ? undefined : rating });
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {movie.posterUrl ? (
          <ImageWithFallback
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <span className="text-muted-foreground text-center px-4">
              {movie.title}
            </span>
          </div>
        )}
        
        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              movie.favorite ? 'fill-red-500 text-red-500' : 'text-white stroke-white stroke-2'
            }`}
          />
        </button>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={movie.status === 'watched' ? 'default' : 'secondary'}>
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
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate">{movie.title}</h3>
            {movie.year && (
              <p className="text-muted-foreground">{movie.year}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleStatus}>
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
              <DropdownMenuItem onClick={toggleFavorite}>
                <Heart className="h-4 w-4 mr-2" />
                {movie.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(movie.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Rating */}
        {movie.status === 'watched' && (
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
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

        {/* Notes */}
        {movie.notes && (
          <p className="text-muted-foreground line-clamp-2">
            {movie.notes}
          </p>
        )}
      </div>
    </Card>
  );
}