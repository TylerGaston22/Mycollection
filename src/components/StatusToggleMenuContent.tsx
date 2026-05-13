/**
 * StatusToggleMenuContent – icon + label for the "Mark as ..." menu item.
 * Shows the opposite status action (e.g. if watched, shows "Mark as Want to See").
 * Used by both ItemCard and ListView dropdown menus.
 */

import { Eye, Clock } from 'lucide-react';
import { getOppositeStatusLabel } from "../utils/contentHelpers";
import type { ItemStatus } from "../constants";

interface StatusToggleMenuContentProps {
  currentStatus: ItemStatus;
  contentType: string;
}

export function StatusToggleMenuContent({ currentStatus, contentType }: StatusToggleMenuContentProps) {
  if (currentStatus === 'watched') {
    return (
      <>
        <Clock className="h-4 w-4 mr-2" />
        Mark as {getOppositeStatusLabel(contentType, currentStatus)}
      </>
    );
  }

  return (
    <>
      <Eye className="h-4 w-4 mr-2" />
      Mark as {getOppositeStatusLabel(contentType, currentStatus)}
    </>
  );
}
