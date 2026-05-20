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
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Copy, Download, Check, Share2 } from 'lucide-react';
import { Item } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
  categoryName: string;
  sectionName: string;
  currentTheme?: ThemeConfig;
}

export function ShareDialog({
  open,
  onOpenChange,
  items,
  categoryName,
  sectionName,
  currentTheme
}: ShareDialogProps) {
  const [hasRecentlyCopied, setHasRecentlyCopied] = useState(false);
  const [formattedShareableText, setFormattedShareableText] = useState('');

  useEffect(() => {
    if (open) {
      generateShareText();
    }
  }, [open, items, categoryName, sectionName]);

  const generateShareText = () => {
    const listHeaderText = `${categoryName} - ${sectionName}`;
    const headerDividerLine = '='.repeat(listHeaderText.length);

    let shareText = `${listHeaderText}\n${headerDividerLine}\n\n`;

    items.forEach((item, index) => {
      shareText += `${index + 1}. ${item.title}`;

      if (item.year) {
        shareText += ` (${item.year})`;
      }

      if (item.rating) {
        shareText += ` - ⭐ ${item.rating}/10`;
      }

      if (item.status === 'watched') {
        shareText += ` ✓`;
      } else if (item.status === 'want-to-see') {
        shareText += ` ○`;
      }

      if (item.favorite) {
        shareText += ` ❤️`;
      }

      shareText += '\n';
      shareText += '\n';
    });

    shareText += `\nTotal: ${items.length} items\n`;
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
  if (items.length !== 1) {
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
              {items.length} item{itemCountSuffixText} in this list
            </p>
          </div>

          <Separator />

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
              style={currentTheme ? {
                borderColor: colorToRgba(currentTheme.accentColor, 0.5),
                color: currentTheme.accentColor,
              } : undefined}
            >
              {copyButtonContent}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
              style={currentTheme ? {
                borderColor: colorToRgba(currentTheme.accentColor, 0.5),
                color: currentTheme.accentColor,
              } : undefined}
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
