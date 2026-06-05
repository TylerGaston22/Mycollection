/**
 * SortHeader – the label + arrow used in TanStack table headers.
 * Tiny presentational helper extracted from ListView so the column
 * factory file can reference it without dragging the whole table
 * component along.
 */

import type { CSSProperties } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortHeaderProps {
  label: string;
  isSorted: false | "asc" | "desc";
  /** Tailwind hover class for the wrapper. */
  headerHoverClass?: string;
  /** Inline style applied via mouseenter/leave when the colour is theme-driven. */
  headerHoverStyle?: CSSProperties;
}

export function SortHeader({ label, isSorted, headerHoverClass, headerHoverStyle }: SortHeaderProps) {
  let sortIcon;
  if (isSorted === "asc") {
    sortIcon = <ArrowUp className="h-3 w-3 ml-1" />;
  } else if (isSorted === "desc") {
    sortIcon = <ArrowDown className="h-3 w-3 ml-1" />;
  } else {
    sortIcon = <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  }

  return (
    <span
      className={`flex items-center transition-colors ${headerHoverClass ?? ""}`}
      onMouseEnter={(event) => {
        if (headerHoverStyle?.color) {
          event.currentTarget.style.color = headerHoverStyle.color as string;
        }
      }}
      onMouseLeave={(event) => {
        if (headerHoverStyle?.color) {
          event.currentTarget.style.color = "";
        }
      }}
    >
      {label}
      {sortIcon}
    </span>
  );
}
