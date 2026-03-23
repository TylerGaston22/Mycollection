import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface FormatGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatExample = `Title,Type,Platform,Genre,Status,Rating,Notes
My Favorite Movie,movie,Netflix,Drama,watched,5,An all-time favorite
A Show I Want to Watch,tv-show,Max,Comedy,want-to-see,,
A Restaurant I Love,restaurant,,Italian,visited,4,Great pasta
A City to Visit,place,,,want-to-visit,,Dream trip`;

const aiPromptCSV = `Please format my list into this exact CSV format:

Title,Type,Platform,Genre,Status,Rating,Notes

Requirements:
- Type must be: movie, tv-show, restaurant, or place
- Status options: watched, want-to-see, visited, want-to-visit
- Rating: 1-5 (only for watched/visited items)
- Use commas to separate fields
- Wrap text in quotes if it contains commas
- Leave empty fields blank but keep the commas

Here's my list:
[PASTE YOUR LIST HERE]`;

const aiPromptTXT = `Please format my list into this exact TXT format with one item per line:

Title | Type | Platform | Genre | Status | Rating | Notes

Requirements:
- Type must be: movie, tv-show, restaurant, or place
- Status options: watched, want-to-see, visited, want-to-visit
- Rating: 1-5 (only for watched/visited items)
- Use | (pipe) to separate fields
- Leave empty fields blank but keep the pipes

Here's my list:
[PASTE YOUR LIST HERE]`;

export function FormatGuideDialog({ open, onOpenChange }: FormatGuideDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPromptType, setCopiedPromptType] = useState<'csv' | 'txt' | null>(null);

  const copyToClipboard = (text: string) => {
    // Fallback method for clipboard copy
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopy = () => {
    const success = copyToClipboard(formatExample);
    if (success) {
      setCopied(true);
      toast.success("Format copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyPrompt = (type: 'csv' | 'txt') => {
    const prompt = type === 'csv' ? aiPromptCSV : aiPromptTXT;
    const success = copyToClipboard(prompt);
    if (success) {
      setCopiedPromptType(type);
      toast.success("AI Prompt copied to clipboard!");
      setTimeout(() => setCopiedPromptType(null), 2000);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV/TXT Format Guide</DialogTitle>
          <DialogDescription>
            Use this format for bulk importing items. You can copy this format and paste it into AI tools like ChatGPT to help format your list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Required Format:</h4>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-mono">Title,Type,Platform,Genre,Status,Rating,Notes</p>
              <div className="space-y-1 text-muted-foreground">
                <p>• <strong>Title</strong>: Name of the item (required)</p>
                <p>• <strong>Type</strong>: movie, tv-show, restaurant, or place (required)</p>
                <p>• <strong>Platform</strong>: Where to watch/find it (optional)</p>
                <p>• <strong>Genre</strong>: Category or type (optional)</p>
                <p>• <strong>Status</strong>: watched, want-to-see, visited, or want-to-visit (optional, defaults based on type)</p>
                <p>• <strong>Rating</strong>: Number from 1-5 (optional, only for watched/visited items)</p>
                <p>• <strong>Notes</strong>: Any additional notes (optional)</p>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Example CSV:</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Format
                  </>
                )}
              </Button>
            </div>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre className="whitespace-pre">{formatExample}</pre>
            </div>
          </div>

          {/* AI Prompt Suggestion */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              💡 Pro Tip: Use AI to Format Your List
            </h4>
            <p className="text-sm text-muted-foreground">
              Copy the format above and paste it into ChatGPT or Claude along with your list of movies/shows/places. Ask:
            </p>
            <div className="bg-white dark:bg-slate-900 p-3 rounded text-sm italic border">
              "Please format my list according to this CSV format: [paste format here]. Here's my list: [paste your list]"
            </div>
            <div className="flex items-center justify-between mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyPrompt('csv')}
                className="gap-2"
              >
                {copiedPromptType === 'csv' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy CSV Prompt
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyPrompt('txt')}
                className="gap-2"
              >
                {copiedPromptType === 'txt' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy TXT Prompt
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Important Notes */}
          <div className="space-y-2 text-sm text-muted-foreground border-l-4 border-orange-500 pl-4">
            <p><strong>Important:</strong></p>
            <ul className="space-y-1 list-disc list-inside">
              <li>First row must be the header (column names)</li>
              <li>Use commas to separate fields</li>
              <li>Wrap text in quotes if it contains commas</li>
              <li>For empty fields, leave a space so we know it's empty (e.g., Title, ,Genre)</li>
              <li>Both .csv and .txt files are accepted</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}