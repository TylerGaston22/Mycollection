export { mockUsers, DEMO_USER_ID, DEMO_CREDENTIALS } from './users';
export { mockCustomTabs, mockCustomSections } from './collections';

import { mockMovies } from './movies';
import { mockTvShows } from './tvShows';
import { mockRestaurants } from './restaurants';
import { mockPlaces } from './places';

export const mockItems = [...mockMovies, ...mockTvShows, ...mockRestaurants, ...mockPlaces];
