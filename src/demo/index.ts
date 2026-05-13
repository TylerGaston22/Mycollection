/**
 * Demo barrel – all demo-mode data and credentials live in this folder
 * to keep the demo experience isolated from real-user (Supabase) code paths.
 * Real users never touch anything exported from here.
 */
export { mockUsers, DEMO_USER_ID, DEMO_CREDENTIALS } from './users';
export { mockCustomTabs, mockCustomSections } from './collections';
export { loadDemoData, saveDemoData, useDemoSync } from './storage';

import { mockMovies } from './movies';
import { mockTvShows } from './tvShows';
import { mockRestaurants } from './restaurants';
import { mockPlaces } from './places';

export const mockItems = [...mockMovies, ...mockTvShows, ...mockRestaurants, ...mockPlaces];
