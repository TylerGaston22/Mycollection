/**
 * StatusBadge – displays the watched/want-to-see status with an icon.
 * Adapts label text based on content type (e.g. "Visited" for restaurants).
 * Used by both MovieCard and ListView.
 */

import { Eye, Clock } from 'lucide-react';
import { Badge } from "./ui/badge";
import { getStatusLabel } from "../utils/contentHelpers";
import type { ItemStatus } from "../constants";

interface StatusBadgeProps {
  status: ItemStatus;
  contentType: string;
  className?: string;
}

export function StatusBadge({ status, contentType, className = '' }: StatusBadgeProps) {
  let variant: 'default' | 'secondary';
  if (status === 'watched') {
    variant = 'default';
  } else {
    variant = 'secondary';
  }

  let content;
  if (status === 'watched') {
    content = (
      <>
        <Eye className="h-3 w-3 mr-1" />
        {getStatusLabel(contentType, 'watched')}
      </>
    );
  } else {
    content = (
      <>
        <Clock className="h-3 w-3 mr-1" />
        {getStatusLabel(contentType, 'want-to-see')}
      </>
    );
  }

  return (
    <Badge variant={variant} className={className}>
      {content}
    </Badge>
  );
}
