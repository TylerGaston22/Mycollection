/**
 * Mock places – seed data for the demo account's travel destinations.
 * Contains 20 global destinations with location, category, visit
 * status, and personal notes for the demo experience.
 */
import { Movie } from "../types";

export const mockPlaces: Movie[] = [
  { id: "demo-place-1", title: "Kyoto", year: "Japan", platform: "Visit Japan", genre: "City", type: "place", status: "want-to-see", favorite: true, notes: "Ancient temples, bamboo forests, geisha districts", posterUrl: "" },
  { id: "demo-place-2", title: "Santorini", year: "Greece", platform: "Visit Greece", genre: "Island", type: "place", status: "watched", favorite: true, rating: 5, notes: "White cliffside villages and epic sunsets - pure magic!", posterUrl: "" },
  { id: "demo-place-3", title: "Machu Picchu", year: "Peru", platform: "Peru Travel", genre: "Historical Site", type: "place", status: "want-to-see", favorite: true, notes: "Ancient Incan citadel in the clouds - dream destination", posterUrl: "" },
  { id: "demo-place-4", title: "Iceland", year: "Europe", platform: "Inspired by Iceland", genre: "Country", type: "place", status: "watched", favorite: true, rating: 5, notes: "Northern lights, glaciers, hot springs - otherworldly!", posterUrl: "" },
  { id: "demo-place-5", title: "Bali", year: "Indonesia", platform: "Indonesia Travel", genre: "Island", type: "place", status: "watched", rating: 4, favorite: false, notes: "Rice terraces, temples, beaches - tropical paradise", posterUrl: "" },
  { id: "demo-place-6", title: "Patagonia", year: "Argentina/Chile", platform: "Patagonia Travel", genre: "Natural Wonder", type: "place", status: "want-to-see", favorite: true, notes: "Torres del Paine, Perito Moreno Glacier - wild beauty", posterUrl: "" },
  { id: "demo-place-7", title: "New Zealand", year: "Oceania", platform: "Tourism New Zealand", genre: "Country", type: "place", status: "watched", favorite: true, rating: 5, notes: "Milford Sound, Hobbiton, adventure capital - Middle-earth!", posterUrl: "" },
  { id: "demo-place-8", title: "Paris", year: "France", platform: "Paris Tourism", genre: "City", type: "place", status: "watched", rating: 5, favorite: false, notes: "Louvre, Eiffel Tower, café culture - the city of lights", posterUrl: "" },
  { id: "demo-place-9", title: "Safari in Tanzania", year: "Africa", platform: "Tanzania Parks", genre: "Adventure", type: "place", status: "want-to-see", favorite: true, notes: "Serengeti migration, Ngorongoro Crater - ultimate safari", posterUrl: "" },
  { id: "demo-place-10", title: "Norwegian Fjords", year: "Norway", platform: "Visit Norway", genre: "Region", type: "place", status: "want-to-see", favorite: false, notes: "Geirangerfjord, Bergen, midnight sun - dramatic beauty", posterUrl: "" },
  { id: "demo-place-11", title: "Great Barrier Reef", year: "Australia", platform: "Tourism Australia", genre: "Natural Wonder", type: "place", status: "watched", rating: 5, favorite: false, notes: "World's largest reef system - snorkeled with sea turtles!", posterUrl: "" },
  { id: "demo-place-12", title: "Venice", year: "Italy", platform: "Venice Tourism", genre: "City", type: "place", status: "watched", favorite: true, rating: 5, notes: "Canals, St. Mark's, gondolas - timeless romance", posterUrl: "" },
  { id: "demo-place-13", title: "Petra", year: "Jordan", platform: "Visit Jordan", genre: "Historical Site", type: "place", status: "want-to-see", favorite: false, notes: "Ancient carved rock city - Indiana Jones vibes", posterUrl: "" },
  { id: "demo-place-14", title: "Banff National Park", year: "Canada", platform: "Parks Canada", genre: "National Park", type: "place", status: "want-to-see", favorite: false, notes: "Lake Louise, Moraine Lake - Canadian Rockies beauty", posterUrl: "" },
  { id: "demo-place-15", title: "Tokyo", year: "Japan", platform: "Go Tokyo", genre: "City", type: "place", status: "watched", rating: 5, favorite: false, notes: "Shibuya crossing, teamLab, sushi - neon wonderland", posterUrl: "" },
  { id: "demo-place-16", title: "Amalfi Coast", year: "Italy", platform: "Amalfi Coast Tourism", genre: "Region", type: "place", status: "watched", rating: 5, favorite: false, notes: "Positano, Ravello, lemon groves - coastal perfection", posterUrl: "" },
  { id: "demo-place-17", title: "Swiss Alps", year: "Switzerland", platform: "Switzerland Tourism", genre: "Mountains", type: "place", status: "want-to-see", favorite: true, notes: "Matterhorn, Jungfrau, scenic trains - alpine paradise", posterUrl: "" },
  { id: "demo-place-18", title: "Maldives", year: "Indian Ocean", platform: "Visit Maldives", genre: "Islands", type: "place", status: "want-to-see", favorite: false, notes: "Overwater bungalows, crystal clear water - ultimate escape", posterUrl: "" },
  { id: "demo-place-19", title: "Marrakech", year: "Morocco", platform: "Morocco Tourism", genre: "City", type: "place", status: "watched", rating: 4, favorite: false, notes: "Medina, souks, Jardin Majorelle - sensory overload", posterUrl: "" },
  { id: "demo-place-20", title: "Yellowstone National Park", year: "USA", platform: "NPS", genre: "National Park", type: "place", status: "want-to-see", favorite: false, notes: "Geysers, wildlife, hot springs - America's first national park", posterUrl: "" },
];
