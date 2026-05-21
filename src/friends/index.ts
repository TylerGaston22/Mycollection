/**
 * Friends barrel — single entry point for the friend system feature.
 * Everything else in the app imports from here, not from individual files.
 */

export { useFriends } from "./useFriends";
export { FriendsDialog } from "./FriendsDialog";
export type { FriendSummary, UserMatch, FriendshipStatus } from "./client";
