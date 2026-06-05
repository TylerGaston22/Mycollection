/**
 * ListView – sortable table view for collection items.
 * Built on TanStack React Table. The actual column definitions live in
 * ./listViewColumns.tsx; this component is the table shell + the two
 * dialog state machines (full Edit + QuickEdit).
 *
 * Clicking a row (outside an interactive cell) opens the item detail
 * dialog via onItemClick. Clicking a cell opens either the QuickEdit
 * (platform / genre / notes) or the full Edit dialog (via the kebab).
 */

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import type { CSSProperties } from "react";
import { Item } from "../../types";
import { ROW_HOVER_CLASS } from "../../utils/hoverStyles";
import { getContentTypeFieldConfig, isMediaContentType } from "../../utils/contentHelpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ItemFormDialog } from "../dialogs/ItemFormDialog";
import { QuickEditDialog } from "../dialogs/QuickEditDialog";
import { buildListViewColumns, type QuickEditField } from "./listViewColumns";
import { useItemActions } from "../../hooks/useItemActions";
import { ThemeConfig } from "../../utils/themeConfig";

interface ListViewProps {
  items: Item[];
  /** Active content type. Drives per-type column scoping — non-media
   *  types (restaurants / places / custom) drop the Genre column and
   *  relabel the platform header. */
  contentType: string;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onItemClick?: (item: Item) => void;
  isDarkMode?: boolean;
  currentTheme?: ThemeConfig;
}

export function ListView({
  items,
  contentType,
  onUpdate,
  onDelete,
  onItemClick,
  isDarkMode = false,
  currentTheme,
}: ListViewProps) {
  const isMedia = isMediaContentType(contentType);
  const platformLabel = getContentTypeFieldConfig(contentType).platformFieldLabel;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [movieBeingEdited, setMovieBeingEdited] = useState<Item | null>(null);
  const [movieBeingQuickEdited, setMovieBeingQuickEdited] = useState<Item | null>(null);
  const [fieldBeingQuickEdited, setFieldBeingQuickEdited] = useState<QuickEditField | null>(null);

  const { toggleFavorite, toggleStatus, setRating } = useItemActions(onUpdate);

  // Header colour / hover behaviour varies by mode.
  const titleTextColor = isDarkMode ? "text-page-fg" : "";
  let headerHoverClass = "hover:text-foreground";
  let headerHoverStyle: CSSProperties = {};
  if (isDarkMode && currentTheme) {
    headerHoverClass = "";
    headerHoverStyle = { color: currentTheme.accentColor };
  } else if (isDarkMode) {
    headerHoverClass = "hover:text-orange-300";
  }

  const handleOpenQuickEdit = (item: Item, field: QuickEditField) => {
    setMovieBeingQuickEdited(item);
    setFieldBeingQuickEdited(field);
  };

  const allColumns = buildListViewColumns({
    isMedia,
    platformLabel,
    isDarkMode,
    headerHoverClass,
    headerHoverStyle,
    titleTextColor,
    toggleFavorite,
    toggleStatus,
    setRating,
    onItemClick,
    onOpenQuickEdit: handleOpenQuickEdit,
    onOpenEdit: setMovieBeingEdited,
    onDelete,
  });

  // Genre column is dropped for non-media types (restaurants / places /
  // custom) since the concept doesn't apply there.
  const columns = isMedia
    ? allColumns
    : allColumns.filter((col: { accessorKey?: string }) => col.accessorKey !== "genre");

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
                <TableHead key={header.id} className={titleTextColor}>
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
              className={`${ROW_HOVER_CLASS} cursor-pointer`}
              onClick={(event) => {
                // Whole row opens the detail dialog, but inner interactive
                // elements (heart, "Netflix" quick-edit, kebab menu, etc.)
                // should keep their own behaviour. If the click hit one of
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
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) setMovieBeingEdited(null);
        }}
        onUpdate={onUpdate}
      />

      <QuickEditDialog
        item={movieBeingQuickEdited}
        field={fieldBeingQuickEdited}
        onSave={(movieId, field, value) => onUpdate(movieId, { [field]: value })}
        onClose={() => {
          setMovieBeingQuickEdited(null);
          setFieldBeingQuickEdited(null);
        }}
      />
    </div>
  );
}
