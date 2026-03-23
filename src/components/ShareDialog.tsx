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
import { Movie } from "../types/movie";
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
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    if (open) {
      generateShareText();
    }
  }, [open, movies, categoryName, sectionName]);

  const generateShareText = () => {
    const header = `${categoryName} - ${sectionName}`;
    const divider = '='.repeat(header.length);
    
    let text = `${header}\n${divider}\n\n`;
    
    movies.forEach((movie, index) => {
      text += `${index + 1}. ${movie.title}`;
      
      if (movie.year) {
        text += ` (${movie.year})`;
      }
      
      if (movie.rating) {
        text += ` - ⭐ ${movie.rating}/10`;
      }
      
      if (movie.status === 'watched') {
        text += ` ✓`;
      } else if (movie.status === 'want-to-see') {
        text += ` ○`;
      }
      
      if (movie.favorite) {
        text += ` ❤️`;
      }
      
      text += '\n';
      
      if (movie.description) {
        text += `   ${movie.description}\n`;
      }
      
      text += '\n';
    });
    
    text += `\nTotal: ${movies.length} items\n`;
    text += `Generated on ${new Date().toLocaleDateString()}`;
    
    setShareText(text);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('Copied to clipboard!', {
        description: 'You can now paste this list anywhere.'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Please try again.'
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([shareText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${categoryName}-${sectionName}-${new Date().toISOString().split('T')[0]}.txt`;
    link.download = fileName.replace(/\s+/g, '-').toLowerCase();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('List downloaded!', {
      description: 'Check your downloads folder.'
    });
  };

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
              value={shareText}
              readOnly
              className="mt-2 font-mono text-sm h-64 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {movies.length} item{movies.length !== 1 ? 's' : ''} in this list
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
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
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
