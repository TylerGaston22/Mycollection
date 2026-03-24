/**
 * ListView – sortable table view for collection items.
 * Built on TanStack React Table with sortable columns for favourite,
 * title, platform, genre, status, and rating. Clicking a cell opens
 * either a QuickEditDialog (platform/genre/notes) or the full
 * MovieFormDialog (via the actions menu).
 */

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Movie } from "../types";
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
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { MovieFormDialog } from "./MovieFormDialog";
import { QuickEditDialog } from "./QuickEditDialog";
import { useItemActions } from "../hooks/useItemActions";
import { getStatusLabel, getOppositeStatusLabel } from "../utils/contentHelpers";

interface ListViewProps {
  movies: Movie[];
  onUpdate: (id: string, updates: Partial<Movie>) => void;
  onDelete: (id: string) => void;
  onMovieClick?: (movie: Movie) => void;
  isDarkMode?: boolean;
}

const columnHelper = createColumnHelper<Movie>();

export function ListView({ movies, onUpdate, onDelete, onMovieClick, isDarkMode }: ListViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [movieBeingEdited, setMovieBeingEdited] = useState<Movie | null>(null);
  const [movieBeingQuickEdited, setMovieBeingQuickEdited] = useState<Movie | null>(null);
  const [fieldBeingQuickEdited, setFieldBeingQuickEdited] = useState<'platform' | 'genre' | 'notes' | null>(null);

  const { toggleFavorite, toggleStatus, setRating } = useItemActions(onUpdate);

  let textColor = '';
  if (isDarkMode) {
    textColor = 'text-white';
  }

  let headerHover = 'hover:text-foreground';
  if (isDarkMode) {
    headerHover = 'hover:text-orange-300';
  }

  const SortHeader = ({ label, isSorted }: { label: string; isSorted: false | 'asc' | 'desc' }) => {
    let sortIcon;
    if (isSorted === 'asc') {
      sortIcon = <ArrowUp className="h-3 w-3 ml-1" />;
    } else if (isSorted === 'desc') {
      sortIcon = <ArrowDown className="h-3 w-3 ml-1" />;
    } else {
      sortIcon = <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    }
    return (
      <span className={`flex items-center transition-colors ${headerHover}`}>
        {label}{sortIcon}
      </span>
    );
  };

  // -- Column definitions for TanStack React Table --
  const columns = [
    columnHelper.accessor('favorite', {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          <SortHeader label="Fav" isSorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        let heartClass = 'text-white stroke-white stroke-2';
        if (row.original.favorite) {
          heartClass = 'fill-red-500 text-red-500';
        }
        return (
          <button onClick={() => toggleFavorite(row.original)} className="hover:scale-110 transition-transform">
            <Heart className={`h-5 w-5 ${heartClass}`} />
          </button>
        );
      },
      sortingFn: (a, b) => {
        if (a.original.favorite === b.original.favorite) return 0;
        if (a.original.favorite) return -1;
        return 1;
      },
    }),
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          <SortHeader label="Title" isSorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <button
          onClick={() => onMovieClick?.(row.original)}
          onContextMenu={(e) => { e.preventDefault(); onMovieClick?.(row.original); }}
          className={`hover:opacity-70 transition-opacity cursor-pointer text-left ${textColor}`}
        >
          {row.original.title}
        </button>
      ),
    }),
    columnHelper.accessor('platform', {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          <SortHeader label="Where to Watch" isSorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const movie = row.original;
        let platformContent;
        if (movie.platform) {
          let badgeClass = 'cursor-pointer';
          if (isDarkMode) {
            badgeClass += ' text-white border-white/30';
          }
          platformContent = <Badge variant="outline" className={badgeClass}>{movie.platform}</Badge>;
        } else {
          let emptyClass = 'cursor-pointer text-muted-foreground';
          if (isDarkMode) {
            emptyClass = 'cursor-pointer text-gray-400';
          }
          platformContent = <span className={emptyClass}>-</span>;
        }
        return (
          <button onClick={() => { setMovieBeingQuickEdited(movie); setFieldBeingQuickEdited('platform'); }} className="hover:opacity-70 transition-opacity">
            {platformContent}
          </button>
        );
      },
    }),
    columnHelper.accessor('genre', {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          <SortHeader label="Genre" isSorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const movie = row.original;
        let genreContent;
        if (movie.genre) {
          let badgeClass = 'cursor-pointer';
          if (isDarkMode) {
            badgeClass += ' text-white bg-white/10';
          }
          genreContent = <Badge variant="secondary" className={badgeClass}>{movie.genre}</Badge>;
        } else {
          let emptyClass = 'cursor-pointer text-muted-foreground';
          if (isDarkMode) {
            emptyClass = 'cursor-pointer text-gray-400';
          }
          genreContent = <span className={emptyClass}>-</span>;
        }
        return (
          <button onClick={() => { setMovieBeingQuickEdited(movie); setFieldBeingQuickEdited('genre'); }} className="hover:opacity-70 transition-opacity">
            {genreContent}
          </button>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          <SortHeader label="Status" isSorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const movie = row.original;
        let badgeVariant: 'default' | 'secondary' = 'secondary';
        if (movie.status === 'watched') {
          badgeVariant = 'default';
        }
        let badgeClass = 'cursor-pointer';
        if (isDarkMode) {
          badgeClass += ' text-white border-white/30 bg-transparent';
        }
        let statusContent;
        if (movie.status === 'watched') {
          statusContent = <><Eye className="h-3 w-3 mr-1" />{getStatusLabel(movie.type, 'watched')}</>;
        } else {
          statusContent = <><Clock className="h-3 w-3 mr-1" />{getStatusLabel(movie.type, 'want-to-see')}</>;
        }
        return (
          <button onClick={() => toggleStatus(movie)} className="hover:opacity-80 transition-opacity">
            <Badge variant={badgeVariant} className={badgeClass}>
              {statusContent}
            </Badge>
          </button>
        );
      },
    }),
    columnHelper.accessor('rating', {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          <SortHeader label="Rating" isSorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => {
        const movie = row.original;
        if (movie.status !== 'watched') return null;
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              let starClass = 'text-muted-foreground/40';
              if (movie.rating && star <= movie.rating) {
                starClass = 'fill-yellow-500 text-yellow-500';
              }
              return (
                <button key={star} onClick={() => setRating(movie, star)} className="hover:scale-110 transition-transform">
                  <Star className={`h-4 w-4 ${starClass}`} />
                </button>
              );
            })}
          </div>
        );
      },
      sortingFn: (a, b) => (b.original.rating ?? 0) - (a.original.rating ?? 0),
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      enableSorting: false,
      cell: ({ row }) => (
        <button onClick={() => { setMovieBeingQuickEdited(row.original); setFieldBeingQuickEdited('notes'); }} className="hover:opacity-70 transition-opacity w-full text-left max-w-[300px] block">
          <p className="truncate text-muted-foreground cursor-pointer">{row.original.notes || '-'}</p>
        </button>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => {
        const movie = row.original;
        let statusMenuItemContent;
        if (movie.status === 'watched') {
          statusMenuItemContent = <><Clock className="h-4 w-4 mr-2" />Mark as {getOppositeStatusLabel(movie.type, movie.status)}</>;
        } else {
          statusMenuItemContent = <><Eye className="h-4 w-4 mr-2" />Mark as {getOppositeStatusLabel(movie.type, movie.status)}</>;
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setMovieBeingEdited(movie); }}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleStatus(movie); }}>
                {statusMenuItemContent}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(movie.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: movies,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={textColor}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/50">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MovieFormDialog
        movie={movieBeingEdited}
        open={!!movieBeingEdited}
        onOpenChange={(isOpen: boolean) => { if (!isOpen) setMovieBeingEdited(null); }}
        onUpdate={onUpdate}
      />

      <QuickEditDialog
        movie={movieBeingQuickEdited}
        field={fieldBeingQuickEdited}
        onSave={(movieId, field, value) => onUpdate(movieId, { [field]: value })}
        onClose={() => { setMovieBeingQuickEdited(null); setFieldBeingQuickEdited(null); }}
      />
    </div>
  );
}
