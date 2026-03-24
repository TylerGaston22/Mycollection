/**
 * ShareDialog – export a filtered item list as formatted text.
 * Generates a human-readable preview with titles, ratings, and status
 * symbols, then offers copy-to-clipboard and download-as-txt actions.
 */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Copy, Download, Check, Share2 } from 'lucide-react';
import { Movie } from "../types";
import { toast } from "sonner@2.0.3";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movies: Movie[];
  categoryName: string;
  sectionName: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  movies,
  categoryName,
  sectionName
}: ShareDialogProps) {
  const [hasRecentlyCopied, setHasRecentlyCopied] = useState(false);
  const [formattedShareableText, setFormattedShareableText] = useState('');

  useEffect(() => {
    if (open) {
      generateShareText();
    }
  }, [open, movies, categoryName, sectionName]);

  const generateShareText = () => {
    const listHeaderText = `${categoryName} - ${sectionName}`;
    const headerDividerLine = '='.repeat(listHeaderText.length);

    let shareText = `${listHeaderText}\n${headerDividerLine}\n\n`;

    movies.forEach((movie, index) => {
      shareText += `${index + 1}. ${movie.title}`;

      if (movie.year) {
        shareText += ` (${movie.year})`;
      }

      if (movie.rating) {
        shareText += ` - ⭐ ${movie.rating}/10`;
      }

      if (movie.status === 'watched') {
        shareText += ` ✓`;
      } else if (movie.status === 'want-to-see') {
        shareText += ` ○`;
      }

      if (movie.favorite) {
        shareText += ` ❤️`;
      }

      shareText += '\n';
      shareText += '\n';
    });

    shareText += `\nTotal: ${movies.length} items\n`;
    shareText += `Generated on ${new Date().toLocaleDateString()}`;

    setFormattedShareableText(shareText);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareableText);
      setHasRecentlyCopied(true);
      toast.success('Copied to clipboard!', {
        description: 'You can now paste this list anywhere.'
      });
      setTimeout(() => setHasRecentlyCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Please try again.'
      });
    }
  };

  const handleDownload = () => {
    const jsonFileBlob = new Blob([formattedShareableText], { type: 'text/plain' });
    const downloadableFileUrl = URL.createObjectURL(jsonFileBlob);
    const downloadLinkElement = document.createElement('a');
    downloadLinkElement.href = downloadableFileUrl;
    const rawFileName = `${categoryName}-${sectionName}-${new Date().toISOString().split('T')[0]}.txt`;
    downloadLinkElement.download = rawFileName.replace(/\s+/g, '-').toLowerCase();
    document.body.appendChild(downloadLinkElement);
    downloadLinkElement.click();
    document.body.removeChild(downloadLinkElement);
    URL.revokeObjectURL(downloadableFileUrl);

    toast.success('List downloaded!', {
      description: 'Check your downloads folder.'
    });
  };

  let itemCountSuffixText;
  if (movies.length !== 1) {
    itemCountSuffixText = 's';
  } else {
    itemCountSuffixText = '';
  }

  let copyButtonContent;
  if (hasRecentlyCopied) {
    copyButtonContent = (
      <>
        <Check className="h-4 w-4" />
        Copied!
      </>
    );
  } else {
    copyButtonContent = (
      <>
        <Copy className="h-4 w-4" />
        Copy to Clipboard
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share List
          </DialogTitle>
          <DialogDescription>
            Copy this formatted list to share with others or download as a text file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div>
            <Label>Preview</Label>
            <Textarea
              value={formattedShareableText}
              readOnly
              className="mt-2 font-mono text-sm h-64 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {movies.length} item{itemCountSuffixText} in this list
            </p>
          </div>

          <Separator />

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copyButtonContent}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download as .txt
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Share Tips:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Copy and paste into messages, emails, or notes</li>
              <li>• Download to share as a file attachment</li>
              <li>• Symbols: ✓ = Watched/Visited, ○ = Want to see/visit, ❤️ = Favorite</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
