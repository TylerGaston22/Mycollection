/**
 * Mock games – seed data for the demo account's Gaming collection.
 * Mix of platforms, genres, played/want-to-play, and a few favourites
 * so the Gaming tab looks alive on first run (matches the shape of
 * the Movies/TV seed).
 */
import { Item } from "../types";

export const mockGames: Item[] = [
  { id: "demo-game-1", title: "The Legend of Zelda: Tears of the Kingdom", platform: "Switch", genre: "Adventure", type: "game", status: "watched", favorite: true, rating: 5, posterUrl: "" },
  { id: "demo-game-2", title: "Elden Ring", platform: "PS5", genre: "RPG", type: "game", status: "watched", favorite: true, rating: 5, posterUrl: "" },
  { id: "demo-game-3", title: "Baldur's Gate 3", platform: "Steam", genre: "RPG", type: "game", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-game-4", title: "Hollow Knight: Silksong", platform: "Switch", genre: "Platformer", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-5", title: "Hades II", platform: "Steam", genre: "Roguelike", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-6", title: "Cyberpunk 2077: Phantom Liberty", platform: "PS5", genre: "RPG", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-7", title: "Final Fantasy VII Rebirth", platform: "PS5", genre: "RPG", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-8", title: "Stardew Valley", platform: "Steam", genre: "Simulation", type: "game", status: "watched", rating: 5, favorite: true, posterUrl: "" },
  { id: "demo-game-9", title: "Red Dead Redemption 2", platform: "Xbox", genre: "Adventure", type: "game", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-game-10", title: "Persona 5 Royal", platform: "Switch", genre: "RPG", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-11", title: "God of War Ragnarök", platform: "PS5", genre: "Action", type: "game", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-game-12", title: "Hollow Knight", platform: "Steam", genre: "Platformer", type: "game", status: "watched", rating: 5, favorite: true, posterUrl: "" },
  { id: "demo-game-13", title: "Celeste", platform: "Switch", genre: "Platformer", type: "game", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-game-14", title: "Halo Infinite", platform: "Xbox", genre: "FPS", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-15", title: "Helldivers 2", platform: "Steam", genre: "Co-op", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-16", title: "Disco Elysium", platform: "Steam", genre: "RPG", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-17", title: "Resident Evil 4 Remake", platform: "PS5", genre: "Horror", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-18", title: "Metroid Prime Remastered", platform: "Switch", genre: "Adventure", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-19", title: "Super Mario Bros. Wonder", platform: "Switch", genre: "Platformer", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-20", title: "Outer Wilds", platform: "Steam", genre: "Puzzle", type: "game", status: "watched", rating: 5, favorite: true, posterUrl: "" },
  { id: "demo-game-21", title: "Death Stranding", platform: "PS5", genre: "Adventure", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-22", title: "Slay the Spire", platform: "Steam", genre: "Roguelike", type: "game", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-game-23", title: "Sea of Stars", platform: "Switch", genre: "RPG", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-24", title: "Forza Horizon 5", platform: "Xbox", genre: "Racing", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-25", title: "Pizza Tower", platform: "Steam", genre: "Platformer", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-26", title: "Inside", platform: "Steam", genre: "Puzzle", type: "game", status: "watched", rating: 4, favorite: false, posterUrl: "" },
  { id: "demo-game-27", title: "Animal Well", platform: "Steam", genre: "Adventure", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
  { id: "demo-game-28", title: "Balatro", platform: "Steam", genre: "Roguelike", type: "game", status: "watched", rating: 5, favorite: true, posterUrl: "" },
  { id: "demo-game-29", title: "The Witcher 3: Wild Hunt", platform: "PS5", genre: "RPG", type: "game", status: "watched", rating: 5, favorite: false, posterUrl: "" },
  { id: "demo-game-30", title: "Spider-Man 2", platform: "PS5", genre: "Action", type: "game", status: "want-to-see", favorite: false, posterUrl: "" },
];
