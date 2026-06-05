/**
 * loadProfile – fetch the profile row for a Supabase user and shape it
 * into the app's User type. Pulled out of useAuth so the hook itself
 * stays focused on session lifecycle (sign-in / sign-out / event
 * listeners) and the data-shaping is testable in isolation.
 *
 * Behaviour:
 *   - PGRST116 (no rows) is treated as "trigger hasn't fired yet" and
 *     falls through silently to a synthesized fallback profile so the
 *     user can still sign in immediately after sign-up.
 *   - Synthetic emails (username-only accounts) are not surfaced —
 *     `email` returns '' for those users so the UI shows them by
 *     username alone.
 *   - `listVisibility` defaults to 'friends' when null / missing on
 *     the row, matching the post-migration DB default.
 */

import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { isSyntheticEmail } from "./username";
import type { User } from "../types";

export async function loadProfile(userId: string, email: string): Promise<User> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // PGRST116 = "no rows" — expected when the trigger hasn't fired yet.
  if (error && error.code !== "PGRST116") {
    toast.error("Failed to load profile", { description: error.message });
  }

  const isSynthetic = isSyntheticEmail(email);
  const displayEmail = isSynthetic ? "" : email;
  const localPart = email.split("@")[0];

  if (data) {
    return {
      id: data.id,
      name: data.name || localPart,
      username: data.username || localPart,
      bio: data.bio || "",
      location: data.location || "",
      profileImage: data.profile_image || undefined,
      email: displayEmail,
      joinDate: new Date(data.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      listVisibility: data.list_visibility === "private" ? "private" : "friends",
    };
  }

  return {
    id: userId,
    name: localPart,
    username: localPart,
    bio: "",
    location: "",
    email: displayEmail,
    joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    listVisibility: "friends",
  };
}
