/**
 * Notes barrel — the notes editor and its read-only gallery. Keeping
 * both behind one entry point means callers never have to know whether
 * a surface edits or only displays the attached screenshots.
 */

export { NotesField } from './NotesField';
export { NoteImageGallery } from './NoteImageGallery';
export { NoteImageCount } from './NoteImageCount';
