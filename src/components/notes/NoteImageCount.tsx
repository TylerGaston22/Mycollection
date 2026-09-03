/**
 * NoteImageCount – "🖼 3" badge marking an item whose notes carry
 * screenshots.
 *
 * Grid cards, list rows, and mobile rows all show a one-line preview of
 * the notes *text*, so an item with only pasted images would otherwise
 * look empty from the outside. This is the cue that there's something
 * to open. Renders nothing when there are no images, so call sites can
 * drop it in unconditionally.
 *
 * Takes className because the three surfaces sit on different colour
 * layers (card tokens vs page-chrome tokens) — see
 * docs/coding-standards.md.
 */

import { ImageIcon } from "lucide-react";

interface NoteImageCountProps {
  images: string[] | undefined;
  className?: string;
}

export function NoteImageCount({ images, className }: NoteImageCountProps) {
  const count = images?.length ?? 0;
  if (count === 0) return null;

  return (
    <span className={className} title={`${count} attached image${count === 1 ? "" : "s"}`}>
      <ImageIcon className="inline h-3 w-3 mr-1 -mt-0.5" />
      {count}
    </span>
  );
}
