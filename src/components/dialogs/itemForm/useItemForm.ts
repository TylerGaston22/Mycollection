/**
 * useItemForm – owns the state + lifecycle of the Add/Edit Item form.
 *
 * Manages:
 *   - one piece of state per editable field (title, year, posterUrl,
 *     status, notes, noteImages, platform, studio, genre, seasons,
 *     episodes, selectedSections),
 *   - a `tmdbResetCount` that bumps each time the dialog opens so the
 *     TMDB autocomplete clears its in-memory results,
 *   - populate-on-open: edit mode hydrates from the existing item,
 *     add mode resets + pre-seeds status / selected section from the
 *     user's current view (so "Add Item" from TV Shows › Watched
 *     defaults to those buckets),
 *   - the submit handler that shapes form values into a partial Item
 *     and dispatches to onUpdate (edit) or onAdd (create).
 *
 * The component using this hook owns only the dialog shell and field
 * rendering — everything stateful lives here, which makes the form's
 * behaviour testable without mounting all the UI.
 */

import { useEffect, useRef, useState } from "react";
import { sanitizeImageUrl } from "../../../utils/sanitize";
import type { Item, CustomSection } from "../../../types";
import type { ItemStatus } from "../../../constants";

/**
 * Maps the user's current sub-section into a default status for new
 * items. Watched bucket → 'watched'; Want to See / All / Favorites /
 * custom → 'want-to-see' (the more useful default since most adds are
 * things you haven't gotten to yet).
 */
export function defaultStatusForActiveSection(activeSection: string | undefined): ItemStatus {
  if (activeSection === "watched") return "watched";
  if (activeSection === "want-to-see") return "want-to-see";
  return "want-to-see";
}

interface UseItemFormArgs {
  /** True while the dialog is open — drives the populate-on-open effect. */
  open: boolean;
  /** Edit mode when set, add mode otherwise. */
  item: Item | null | undefined;
  /** Active content type of the user's current view, used to scope the
   *  custom-section preselect AND as the type for newly-added items. */
  contentType: string;
  activeSection: string | undefined;
  customSections: CustomSection[];
  /** Resolve to true on a successful insert; false (or undefined) keeps
   *  the dialog open so the user sees any error toast and can correct
   *  the input (e.g. duplicate title). */
  onAdd?: (item: Omit<Item, "id">) => Promise<boolean> | void;
  onUpdate?: (id: string, updates: Partial<Item>) => Promise<boolean> | void;
  /** Called once the form has successfully submitted; the dialog uses
   *  this to close itself. NOT called when onAdd/onUpdate returns false. */
  onSubmitted: () => void;
}

export interface ItemFormState {
  title: string;
  setTitle: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  posterUrl: string;
  setPosterUrl: (value: string) => void;
  status: ItemStatus;
  setStatus: (value: ItemStatus) => void;
  notes: string;
  setNotes: (value: string) => void;
  /** URLs of screenshots pasted into the notes field. */
  noteImages: string[];
  setNoteImages: (value: string[]) => void;
  platform: string;
  setPlatform: (value: string) => void;
  studio: string;
  setStudio: (value: string) => void;
  genre: string;
  setGenre: (value: string) => void;
  seasons: string;
  setSeasons: (value: string) => void;
  episodes: string;
  setEpisodes: (value: string) => void;
  selectedSections: string[];
  setSelectedSections: (value: string[]) => void;
  tmdbResetCount: number;
  isValid: boolean;
  handleSubmit: (event: React.FormEvent) => void;
}

export function useItemForm({
  open,
  item,
  contentType,
  activeSection,
  customSections,
  onAdd,
  onUpdate,
  onSubmitted,
}: UseItemFormArgs): ItemFormState {
  const isEditingExistingItem = !!item;

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [status, setStatus] = useState<ItemStatus>("watched");
  const [notes, setNotes] = useState("");
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [studio, setStudio] = useState("");
  const [genre, setGenre] = useState("");
  const [seasons, setSeasons] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  // Bumps on every open so the TMDB autocomplete inside the title field
  // clears its result list.
  const [tmdbResetCount, setTmdbResetCount] = useState(0);

  // The populate-on-open effect reads activeSection / customSections /
  // contentType to seed defaults, but it must NOT re-fire when those
  // values change later — that would clobber whatever the user has
  // typed since the dialog opened. Latest-value refs let the effect
  // read fresh values without depending on them.
  const activeSectionRef = useRef(activeSection);
  const customSectionsRef = useRef(customSections);
  const contentTypeRef = useRef(contentType);
  useEffect(() => {
    activeSectionRef.current = activeSection;
    customSectionsRef.current = customSections;
    contentTypeRef.current = contentType;
  });

  // Populate-on-open: edit mode copies from the item, add mode resets +
  // pre-seeds status / selected section from the user's current view.
  // Dependency list is intentionally [open, item] only — re-populating
  // on every customSections / activeSection update would erase the
  // user's typing if those props change mid-edit (e.g. when Supabase
  // hydration finishes a moment after the dialog opens).
  useEffect(() => {
    if (!open) return;
    setTmdbResetCount((count) => count + 1);

    if (item) {
      setTitle(item.title);
      setYear(item.year || "");
      setPosterUrl(item.posterUrl || "");
      setStatus(item.status);
      setNotes(item.notes || "");
      setNoteImages(item.noteImages || []);
      setPlatform(item.platform || "");
      setStudio(item.studio || "");
      setGenre(item.genre || "");
      setSeasons(item.seasons?.toString() || "");
      setEpisodes(item.episodes?.toString() || "");
      setSelectedSections(item.sections || []);
      return;
    }

    // Add mode reset.
    const liveActiveSection = activeSectionRef.current;
    const liveCustomSections = customSectionsRef.current;
    const liveContentType = contentTypeRef.current;

    setTitle("");
    setYear("");
    setPosterUrl("");
    setStatus(defaultStatusForActiveSection(liveActiveSection));
    setNotes("");
    setNoteImages([]);
    setPlatform("");
    setStudio("");
    setGenre("");
    setSeasons("");
    setEpisodes("");

    // Pre-select the currently active section if it belongs to this
    // content type (so "Add Item" from a custom section auto-checks it).
    let preSelectedSectionIds: string[] = [];
    if (liveActiveSection) {
      const activeSectionBelongsToCurrentContentType = liveCustomSections.some(
        (section) => section.id === liveActiveSection && section.contentType === liveContentType,
      );
      if (activeSectionBelongsToCurrentContentType) {
        preSelectedSectionIds = [liveActiveSection];
      }
    }
    setSelectedSections(preSelectedSectionIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    let parsedSeasons: number | undefined = undefined;
    if (seasons) {
      parsedSeasons = parseInt(seasons);
    }
    let parsedEpisodes: number | undefined = undefined;
    if (episodes) {
      parsedEpisodes = parseInt(episodes);
    }
    let sectionsToSave: string[] | undefined = undefined;
    if (selectedSections.length > 0) {
      sectionsToSave = selectedSections;
    }

    const formDataToSave = {
      title: title.trim(),
      year: year.trim() || undefined,
      posterUrl: sanitizeImageUrl(posterUrl.trim()),
      status,
      notes: notes.trim() || undefined,
      // Always sent, even when empty — the item may have had images
      // that the user just removed, and an omitted field wouldn't clear
      // them (itemToRow only writes the keys that are present).
      noteImages,
      platform: platform.trim() || undefined,
      studio: studio.trim() || undefined,
      genre: genre.trim() || undefined,
      seasons: parsedSeasons,
      episodes: parsedEpisodes,
      sections: sectionsToSave,
    };

    // Await the underlying mutation so we only close the dialog when
    // the add/update actually succeeded. If onAdd returns false (e.g.
    // duplicate-title bail in useItems, or a Supabase error), the
    // dialog stays open and the user keeps their typed input.
    let result: boolean | void;
    if (isEditingExistingItem && item) {
      result = await onUpdate?.(item.id, formDataToSave);
    } else {
      // Newly-created items take the type from the user's current view
      // and never start as a favourite.
      result = await onAdd?.({ ...formDataToSave, type: contentType, favorite: false });
    }

    // Treat undefined as success (legacy void return), false as
    // failure-keep-open, true as success-close.
    if (result === false) return;
    onSubmitted();
  };

  return {
    title,
    setTitle,
    year,
    setYear,
    posterUrl,
    setPosterUrl,
    status,
    setStatus,
    notes,
    setNotes,
    noteImages,
    setNoteImages,
    platform,
    setPlatform,
    studio,
    setStudio,
    genre,
    setGenre,
    seasons,
    setSeasons,
    episodes,
    setEpisodes,
    selectedSections,
    setSelectedSections,
    tmdbResetCount,
    isValid: title.trim().length > 0,
    handleSubmit,
  };
}
