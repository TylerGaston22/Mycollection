/**
 * ListView – sortable table view for collection items.
 * Built on TanStack React Table with sortable columns for favourite,
 * title, platform, genre, status, and rating. Clicking a cell opens
 * either a QuickEditDialog (platform/genre/notes) or the full
 * ItemFormDialog (via the actions menu).
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
import { Item } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Heart, MoreVertical, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { ItemFormDialog } from "../dialogs/ItemFormDialog";
import { QuickEditDialog } from "../dialogs/QuickEditDialog";
import { StarRating } from "./StarRating";
import { StatusBadge } from "./StatusBadge";
import { StatusToggleMenuContent } from "./StatusToggleMenuContent";
import { useItemActions } from "../../hooks/useItemActions";
import { ThemeConfig } from "../../utils/themeConfig";

interface ListViewProps {
  items: Item[];
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onItemClick?: (item: Item) => void;
  isDarkMode?: boolean;
  currentTheme?: ThemeConfig;
}

const columnHelper = createColumnHelper<Item>();

export function ListView({ items, onUpdate, onDelete, onItemClick, isDarkMode, currentTheme }: ListViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [movieBeingEdited, setMovieBeingEdited] = useState<Item | null>(null);
  const [movieBeingQuickEdited, setMovieBeingQuickEdited] = useState<Item | null>(null);
  const [fieldBeingQuickEdited, setFieldBeingQuickEdited] = useState<'platform' | 'genre' | 'notes' | null>(null);

  const { toggleFavorite, toggleStatus, setRating } = useItemActions(onUpdate);

  let textColor = '';
  if (isDarkMode) {
    textColor = 'text-white';
  }

  let headerHover = 'hover:text-foreground';
  let headerHoverStyle: React.CSSProperties = {};
  if (isDarkMode && currentTheme) {
    headerHover = '';
    headerHoverStyle = { color: currentTheme.accentColor };
  } else if (isDarkMode) {
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
      <span
        className={`flex items-center transition-colors ${headerHover}`}
        onMouseEnter={(e) => {
          if (headerHoverStyle.color) {
            e.currentTarget.style.color = headerHoverStyle.color as string;
          }
        }}
        onMouseLeave={(e) => {
          if (headerHoverStyle.color) {
            e.currentTarget.style.color = '';
          }
        }}
      >
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
      // Sort favourites to the top: favourited items get -1, others get 1
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
          onClick={() => onItemClick?.(row.original)}
          // Right-click also opens the detail dialog
          onContextMenu={(e) => { e.preventDefault(); onItemClick?.(row.original); }}
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
        const item = row.original;
        let platformContent;
        if (item.platform) {
          let badgeClass = 'cursor-pointer';
          if (isDarkMode) {
            badgeClass += ' text-white border-white/30';
          }
          platformContent = <Badge variant="outline" className={badgeClass}>{item.platform}</Badge>;
        } else {
          let emptyClass = 'cursor-pointer text-muted-foreground';
          if (isDarkMode) {
            emptyClass = 'cursor-pointer text-gray-400';
          }
          platformContent = <span className={emptyClass}>-</span>;
        }
        return (
          <button onClick={() => { setMovieBeingQuickEdited(item); setFieldBeingQuickEdited('platform'); }} className="hover:opacity-70 transition-opacity">
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
        const item = row.original;
        let genreContent;
        if (item.genre) {
          let badgeClass = 'cursor-pointer';
          if (isDarkMode) {
            badgeClass += ' text-white bg-white/10';
          }
          genreContent = <Badge variant="secondary" className={badgeClass}>{item.genre}</Badge>;
        } else {
          let emptyClass = 'cursor-pointer text-muted-foreground';
          if (isDarkMode) {
            emptyClass = 'cursor-pointer text-gray-400';
          }
          genreContent = <span className={emptyClass}>-</span>;
        }
        return (
          <button onClick={() => { setMovieBeingQuickEdited(item); setFieldBeingQuickEdited('genre'); }} className="hover:opacity-70 transition-opacity">
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
        const item = row.original;
        let badgeClass = 'cursor-pointer';
        if (isDarkMode) {
          badgeClass += ' text-white border-white/30 bg-transparent';
        }
        return (
          <button onClick={() => toggleStatus(item)} className="hover:opacity-80 transition-opacity">
            <StatusBadge status={item.status} contentType={item.type} className={badgeClass} />
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
        const item = row.original;
        // Only display star rating for items with 'watched' status
        if (item.status !== 'watched') return null;
        return <StarRating item={item} onRate={setRating} />;
      },
      // Descending sort: higher ratings first, unrated (nullish) treated as 0
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
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setMovieBeingEdited(item); }}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleStatus(item); }}>
                <StatusToggleMenuContent currentStatus={item.status} contentType={item.type} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(item.id); }}
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
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
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
            <TableRow
              key={row.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={(event) => {
                // Whole row opens the detail dialog, but inner interactive
                // elements (heart, "Netflix" quick-edit, kebab menu, etc.)
                // should keep their own behaviour. closest() finds the
                // nearest interactive ancestor — if the click hit one of
                // those, skip the row handler.
                if ((event.target as HTMLElement).closest('button, a, [role="menuitem"], input')) return;
                onItemClick?.(row.original);
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ItemFormDialog
        item={movieBeingEdited}
        open={!!movieBeingEdited}
        onOpenChange={(isOpen: boolean) => { if (!isOpen) setMovieBeingEdited(null); }}
        onUpdate={onUpdate}
      />

      <QuickEditDialog
        item={movieBeingQuickEdited}
        field={fieldBeingQuickEdited}
        onSave={(movieId, field, value) => onUpdate(movieId, { [field]: value })}
        onClose={() => { setMovieBeingQuickEdited(null); setFieldBeingQuickEdited(null); }}
      />
    </div>
  );
}
