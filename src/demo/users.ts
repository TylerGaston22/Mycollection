/**
 * Mock users – demo account credentials and user profile data.
 * Defines the demo user identity and login credentials used for
 * the one-click demo sign-in flow.
 */
import { User } from "../types";

export const DEMO_USER_ID = "user-demo";
export const DEMO_CREDENTIALS = { username: "demo", password: "demo" };

export const mockUsers: User[] = [
  {
    id: DEMO_USER_ID,
    name: "Demo User",
    username: "@demo",
    bio: "",
    location: "",
    email: "demo@example.com",
    joinDate: "January 2026",
  },
];
