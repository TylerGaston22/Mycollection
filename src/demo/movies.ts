/**
 * Mock items – seed data for the demo account's item collection.
 * Contains 40 popular films across various genres and streaming
 * platforms, pre-populated with watch statuses and ratings.
 */
import { Item } from "../types";

export const mockMovies: Item[] = [
  { id: "demo-item-1", title: "The Shawshank Redemption", platform: "Netflix", genre: "Drama", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-2", title: "Inception", platform: "Max", genre: "Sci-Fi", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-3", title: "The Dark Knight", platform: "Max", genre: "Action", type: "item", status: "watched", favorite: true, rating: 5, posterUrl: "" },
  { id: "demo-item-4", title: "Pulp Fiction", platform: "Netflix", genre: "Crime", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-5", title: "Forrest Gump", platform: "Paramount+", genre: "Drama", type: "item", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-item-6", title: "The Matrix", platform: "Max", genre: "Sci-Fi", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-7", title: "Goodfellas", platform: "Max", genre: "Crime", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-8", title: "The Godfather", platform: "Paramount+", genre: "Crime", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-9", title: "Interstellar", platform: "Paramount+", genre: "Sci-Fi", type: "item", status: "watched", favorite: true, rating: 5, posterUrl: "" },
  { id: "demo-item-10", title: "Parasite", platform: "Hulu", genre: "Thriller", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-11", title: "Spirited Away", platform: "Max", genre: "Animation", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-12", title: "The Lord of the Rings: The Fellowship of the Ring", platform: "Max", genre: "Fantasy", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-13", title: "Fight Club", platform: "Hulu", genre: "Drama", type: "item", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-item-14", title: "The Silence of the Lambs", platform: "Netflix", genre: "Thriller", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-15", title: "Saving Private Ryan", platform: "Paramount+", genre: "War", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-16", title: "Everything Everywhere All at Once", platform: "Paramount+", genre: "Sci-Fi", type: "item", status: "watched", favorite: true, rating: 5, posterUrl: "" },
  { id: "demo-item-17", title: "Oppenheimer", platform: "Peacock", genre: "Biography", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-18", title: "Barbie", platform: "Max", genre: "Comedy", type: "item", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-item-19", title: "Dune", platform: "Max", genre: "Sci-Fi", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-20", title: "Spider-Man: Across the Spider-Verse", platform: "Netflix", genre: "Animation", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-21", title: "The Batman", platform: "Max", genre: "Action", type: "item", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-item-22", title: "Top Gun: Maverick", platform: "Paramount+", genre: "Action", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-23", title: "Avatar: The Way of Water", platform: "Disney+", genre: "Sci-Fi", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-24", title: "Knives Out", platform: "Netflix", genre: "Mystery", type: "item", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-item-25", title: "Glass Onion", platform: "Netflix", genre: "Mystery", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-26", title: "The Menu", platform: "Hulu", genre: "Thriller", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-27", title: "Nope", platform: "Peacock", genre: "Horror", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-28", title: "Past Lives", platform: "Paramount+", genre: "Drama", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-29", title: "Your Name", platform: "Crunchyroll", genre: "Animation", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-30", title: "Train to Busan", platform: "Netflix", genre: "Horror", type: "item", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-item-31", title: "Oldboy", platform: "Max", genre: "Thriller", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-32", title: "The Handmaiden", platform: "Hulu", genre: "Thriller", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-33", title: "Memories of Murder", platform: "Hulu", genre: "Crime", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-34", title: "The Wailing", platform: "Netflix", genre: "Horror", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-35", title: "Weathering with You", platform: "Max", genre: "Animation", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-36", title: "A Silent Voice", platform: "Netflix", genre: "Animation", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-37", title: "Wolf Children", platform: "Hulu", genre: "Animation", type: "item", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-item-38", title: "La La Land", platform: "Netflix", genre: "Musical", type: "item", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-item-39", title: "Whiplash", platform: "Netflix", genre: "Drama", type: "item", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-item-40", title: "Mad Max: Fury Road", platform: "Max", genre: "Action", type: "item", status: "watched", favorite: true, rating: 5, posterUrl: "" },
];
