/**
 * Mock restaurants – seed data for the demo account's restaurant list.
 * Contains 20 world-renowned restaurants with cuisine types, booking
 * platforms, visit statuses, and personal notes.
 */
import { Item } from "../types";

export const mockRestaurants: Item[] = [
  { id: "demo-rest-1", title: "Nobu Malibu", year: "Los Angeles, CA", platform: "OpenTable", genre: "Japanese", type: "restaurant", status: "want-to-see", favorite: true, notes: "Famous for black cod miso and ocean views", posterUrl: "" },
  { id: "demo-rest-2", title: "The French Laundry", year: "Yountville, CA", platform: "Tock", genre: "French", type: "restaurant", status: "want-to-see", favorite: true, notes: "Thomas Keller's legendary 3-Michelin star restaurant", posterUrl: "" },
  { id: "demo-rest-3", title: "Alinea", year: "Chicago, IL", platform: "Tock", genre: "Modern American", type: "restaurant", status: "watched", favorite: true, rating: 5, notes: "Mind-blowing molecular gastronomy - edible balloons!", posterUrl: "" },
  { id: "demo-rest-4", title: "Eleven Madison Park", year: "New York, NY", platform: "Resy", genre: "Contemporary", type: "restaurant", status: "want-to-see", favorite: false, notes: "Plant-based fine dining experience", posterUrl: "" },
  { id: "demo-rest-5", title: "Per Se", year: "New York, NY", platform: "Tock", genre: "French", type: "restaurant", status: "want-to-see", favorite: false, notes: "Thomas Keller's NYC flagship with Central Park views", posterUrl: "" },
  { id: "demo-rest-6", title: "Momofuku Ko", year: "New York, NY", platform: "Resy", genre: "Asian Fusion", type: "restaurant", status: "watched", rating: 4, favorite: false, notes: "David Chang's intimate counter-style dining", posterUrl: "" },
  { id: "demo-rest-7", title: "Sukiyabashi Jiro", year: "Tokyo, Japan", platform: "Hotel Concierge", genre: "Sushi", type: "restaurant", status: "want-to-see", favorite: true, notes: "Jiro's legendary sushi temple - bucket list!", posterUrl: "" },
  { id: "demo-rest-8", title: "Den", year: "Tokyo, Japan", platform: "Website", genre: "Japanese", type: "restaurant", status: "want-to-see", favorite: false, notes: "2 Michelin stars - playful innovative kaiseki", posterUrl: "" },
  { id: "demo-rest-9", title: "Osteria Francescana", year: "Modena, Italy", platform: "Website", genre: "Italian", type: "restaurant", status: "watched", favorite: true, rating: 5, notes: "Massimo Bottura's masterpiece - best meal of my life", posterUrl: "" },
  { id: "demo-rest-10", title: "Noma", year: "Copenhagen, Denmark", platform: "Website", genre: "Nordic", type: "restaurant", status: "want-to-see", favorite: true, notes: "World's most influential restaurant - reopened 2024", posterUrl: "" },
  { id: "demo-rest-11", title: "El Celler de Can Roca", year: "Girona, Spain", platform: "Website", genre: "Spanish", type: "restaurant", status: "want-to-see", favorite: false, notes: "Roca brothers' innovative 3-star restaurant", posterUrl: "" },
  { id: "demo-rest-12", title: "Pujol", year: "Mexico City, Mexico", platform: "OpenTable", genre: "Mexican", type: "restaurant", status: "watched", rating: 5, favorite: false, notes: "Enrique Olvera's modern Mexican - the mole madre!", posterUrl: "" },
  { id: "demo-rest-13", title: "Quintonil", year: "Mexico City, Mexico", platform: "Resy", genre: "Mexican", type: "restaurant", status: "want-to-see", favorite: false, notes: "Jorge Vallejo's contemporary Mexican cuisine", posterUrl: "" },
  { id: "demo-rest-14", title: "Atelier Crenn", year: "San Francisco, CA", platform: "Tock", genre: "French", type: "restaurant", status: "watched", favorite: true, rating: 5, notes: "Dominique Crenn's poetic culinary artistry", posterUrl: "" },
  { id: "demo-rest-15", title: "Benu", year: "San Francisco, CA", platform: "Resy", genre: "Asian Fusion", type: "restaurant", status: "want-to-see", favorite: false, notes: "Corey Lee's 3-Michelin star Asian-American cuisine", posterUrl: "" },
  { id: "demo-rest-16", title: "Gaggan", year: "Bangkok, Thailand", platform: "Website", genre: "Indian", type: "restaurant", status: "want-to-see", favorite: false, notes: "Progressive Indian - emoji tasting menu", posterUrl: "" },
  { id: "demo-rest-17", title: "Ultraviolet", year: "Shanghai, China", platform: "Website", genre: "Experimental", type: "restaurant", status: "watched", rating: 5, favorite: false, notes: "Paul Pairet's multi-sensory 20-course journey", posterUrl: "" },
  { id: "demo-rest-18", title: "Blue Hill at Stone Barns", year: "Tarrytown, NY", platform: "Resy", genre: "Farm-to-Table", type: "restaurant", status: "watched", rating: 5, favorite: false, notes: "Dan Barber's farm experience - vegetables as you've never had them", posterUrl: "" },
  { id: "demo-rest-19", title: "Le Bernardin", year: "New York, NY", platform: "Resy", genre: "Seafood", type: "restaurant", status: "want-to-see", favorite: false, notes: "Eric Ripert's seafood temple - 3 Michelin stars", posterUrl: "" },
  { id: "demo-rest-20", title: "SingleThread", year: "Healdsburg, CA", platform: "Tock", genre: "Japanese", type: "restaurant", status: "want-to-see", favorite: true, notes: "Farm, inn, and 3-star restaurant - complete experience", posterUrl: "" },
];
