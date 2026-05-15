/**
 * TmdbSearchableInput – a title input with an attached TMDB search button.
 * Encapsulates all TMDB UI state (results, loading, error) so the parent
 * form just renders one component and gets a callback when a match is picked.
 *
 * Renders the search button only for media content types (movie / tv-show)
 * AND when TMDB credentials are configured — otherwise it degrades to a
 * plain Input.
 */

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { isMediaContentType } from "../utils/contentHelpers";
import { isTmdbConfigured, searchTmdb, type TmdbSearchResult } from "./client";

interface TmdbSearchableInputProps {
  id?: string;
  contentType: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (result: TmdbSearchResult) => void;
  /** Increment to clear search results (e.g. when the dialog reopens). */
  resetSignal?: number;
  placeholder?: string;
  required?: boolean;
}

export function TmdbSearchableInput({
  id,
  contentType,
  value,
  onChange,
  onPick,
  resetSignal,
  placeholder,
  required,
}: TmdbSearchableInputProps) {
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = isMediaContentType(contentType) && isTmdbConfigured();

  // Clear state whenever the parent signals a reset
  useEffect(() => {
    setResults([]);
    setError(null);
  }, [resetSignal]);

  const handleSearch = async () => {
    const query = value.trim();
    if (!query) return;
    setIsSearching(true);
    setError(null);
    try {
      const found = await searchTmdb(contentType, query);
      setResults(found);
      if (found.length === 0) setError("No matches found.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unknown error";
      setError(`Search failed: ${message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePick = (result: TmdbSearchResult) => {
    onPick(result);
    setResults([]);
    setError(null);
  };

  return (
    <>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (canSearch && event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
          required={required}
        />
        {canSearch && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={!value.trim() || isSearching}
            title="Search TMDB for poster + year"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-muted-foreground">{error}</p>}
      {results.length > 0 && (
        <div className="border rounded-md max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.tmdbId}
              type="button"
              onClick={() => handlePick(result)}
              className="flex w-full items-start gap-3 p-2 text-left hover:bg-accent transition-colors"
            >
              {result.posterUrl ? (
                <img
                  src={result.posterUrl.replace("/w500/", "/w92/")}
                  alt=""
                  className="w-12 h-18 object-cover rounded flex-shrink-0 bg-muted"
                />
              ) : (
                <div className="w-12 h-18 rounded flex-shrink-0 bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.title}</p>
                {result.year && (
                  <p className="text-sm text-muted-foreground">{result.year}</p>
                )}
                {result.overview && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {result.overview}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
