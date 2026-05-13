/**
 * CategoryCountRow – a single row in the collection statistics breakdown.
 * Shows a category badge, description, and item count.
 * Used by ProfileDialog to avoid repeating the same layout 4 times.
 */

import { Badge } from "../ui/badge";

interface CategoryCountRowProps {
  label: string;
  description: string;
  count: number;
}

export function CategoryCountRow({ label, description, count }: CategoryCountRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{label}</Badge>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <span className="text-lg">{count}</span>
    </div>
  );
}
