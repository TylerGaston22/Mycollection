/**
 * listViewColumns – TanStack column definitions for the desktop
 * ListView. Extracted from the component so the table render stays
 * compact and the column shapes can be unit-tested independently
 * (e.g. confirm `isMedia=false` produces a column set without
 * `genre`).
 *
 * All callbacks + state setters the cells need are passed in via
 * BuildColumnsArgs — no module-level closures here.
 */

import type { CSSProperties } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Heart, MoreVertical, Trash2, Edit } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { SortHeader } from "./SortHeader";
import { StarRating } from "./StarRating";
import { StatusBadge } from "./StatusBadge";
import { StatusToggleMenuContent } from "./StatusToggleMenuContent";
import type { Item } from "../../types";
import { NoteImageCount } from "../notes";

const columnHelper = createColumnHelper<Item>();

export type QuickEditField = "platform" | "genre" | "notes";

export interface BuildColumnsArgs {
  /** True when the active content type is movies / tv-show. Drives
   *  inclusion of the genre column (filtered out by the caller, but
   *  this is provided so cell labels can adapt if they ever need to). */
  isMedia: boolean;
  /** Label for the platform column header — per-content-type
   *  ("Where to Watch" / "Cuisine Type" / "Location" / …). */
  platformLabel: string;
  /** True when the page chrome is dark — drives dark-mode badge tints. */
  isDarkMode: boolean;
  /** Tailwind hover class for column headers. */
  headerHoverClass: string;
  /** Inline style applied via mouseenter/leave for theme-tinted hover. */
  headerHoverStyle: CSSProperties;
  /** Tailwind class applied to the Title button's text colour. */
  titleTextColor: string;
  /** Item-action callbacks (favourite, status, rating) from useItemActions. */
  toggleFavorite: (item: Item) => void;
  toggleStatus: (item: Item) => void;
  setRating: (item: Item, rating: number) => void;
  /** Dialog open handlers. */
  onItemClick?: (item: Item) => void;
  onOpenQuickEdit: (item: Item, field: QuickEditField) => void;
  onOpenEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function buildListViewColumns(args: BuildColumnsArgs) {
  const {
    platformLabel,
    isDarkMode,
    headerHoverClass,
    headerHoverStyle,
    titleTextColor,
    toggleFavorite,
    toggleStatus,
    setRating,
    onItemClick,
    onOpenQuickEdit,
    onOpenEdit,
    onDelete,
  } = args;

  const renderSortHeader = (label: string, isSorted: false | "asc" | "desc") => (
    <SortHeader
      label={label}
      isSorted={isSorted}
      headerHoverClass={headerHoverClass}
      headerHoverStyle={headerHoverStyle}
    />
  );

  return [
    columnHelper.accessor("favorite", {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          {renderSortHeader("Fav", column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        let heartClass = "text-page-fg stroke-page-fg stroke-2";
        if (row.original.favorite) heartClass = "fill-red-500 text-red-500";
        return (
          <button onClick={() => toggleFavorite(row.original)} className="hover:scale-110 transition-transform">
            <Heart className={`h-5 w-5 ${heartClass}`} />
          </button>
        );
      },
      // Favourited items get -1 so they sort to the top.
      sortingFn: (a, b) => {
        if (a.original.favorite === b.original.favorite) return 0;
        if (a.original.favorite) return -1;
        return 1;
      },
    }),
    columnHelper.accessor("title", {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          {renderSortHeader("Title", column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <button
          onClick={() => onItemClick?.(row.original)}
          // Right-click also opens the detail dialog.
          onContextMenu={(event) => {
            event.preventDefault();
            onItemClick?.(row.original);
          }}
          className={`hover:opacity-70 transition-opacity cursor-pointer text-left ${titleTextColor}`}
        >
          {row.original.title}
        </button>
      ),
    }),
    columnHelper.accessor("platform", {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          {renderSortHeader(platformLabel, column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        let content;
        if (item.platform) {
          let badgeClass = "cursor-pointer";
          if (isDarkMode) badgeClass += " text-page-fg border-page-border";
          content = <Badge variant="outline" className={badgeClass}>{item.platform}</Badge>;
        } else {
          let emptyClass = "cursor-pointer text-muted-foreground";
          if (isDarkMode) emptyClass = "cursor-pointer text-page-fg-muted";
          content = <span className={emptyClass}>-</span>;
        }
        return (
          <button onClick={() => onOpenQuickEdit(item, "platform")} className="hover:opacity-70 transition-opacity">
            {content}
          </button>
        );
      },
    }),
    columnHelper.accessor("genre", {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          {renderSortHeader("Genre", column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        let content;
        if (item.genre) {
          let badgeClass = "cursor-pointer";
          if (isDarkMode) badgeClass += " text-page-fg bg-page-surface";
          content = <Badge variant="secondary" className={badgeClass}>{item.genre}</Badge>;
        } else {
          let emptyClass = "cursor-pointer text-muted-foreground";
          if (isDarkMode) emptyClass = "cursor-pointer text-page-fg-muted";
          content = <span className={emptyClass}>-</span>;
        }
        return (
          <button onClick={() => onOpenQuickEdit(item, "genre")} className="hover:opacity-70 transition-opacity">
            {content}
          </button>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          {renderSortHeader("Status", column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        let badgeClass = "cursor-pointer";
        if (isDarkMode) badgeClass += " text-page-fg border-page-border bg-transparent";
        return (
          <button onClick={() => toggleStatus(item)} className="hover:opacity-80 transition-opacity">
            <StatusBadge status={item.status} contentType={item.type} className={badgeClass} />
          </button>
        );
      },
    }),
    columnHelper.accessor("rating", {
      header: ({ column }) => (
        <button onClick={column.getToggleSortingHandler()}>
          {renderSortHeader("Rating", column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        // Star rating only applies to "watched" items.
        if (item.status !== "watched") return null;
        return <StarRating item={item} onRate={setRating} />;
      },
      // Descending: higher ratings first; unrated (nullish) treated as 0.
      sortingFn: (a, b) => (b.original.rating ?? 0) - (a.original.rating ?? 0),
    }),
    columnHelper.accessor("notes", {
      header: "Notes",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => onOpenQuickEdit(row.original, "notes")}
          className="hover:opacity-70 transition-opacity w-full text-left max-w-[300px] block"
        >
          <p className="truncate text-page-fg-muted cursor-pointer">
            {row.original.notes || (row.original.noteImages?.length ? "" : "-")}
            <NoteImageCount images={row.original.noteImages} className="ml-1 text-page-fg-faint" />
          </p>
        </button>
      ),
    }),
    columnHelper.display({
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-page-fg hover:text-page-fg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                onOpenEdit(item);
              }}>
                <Edit className="mr-2 h-4 w-4" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                toggleStatus(item);
              }}>
                <StatusToggleMenuContent currentStatus={item.status} contentType={item.type} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
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
}
