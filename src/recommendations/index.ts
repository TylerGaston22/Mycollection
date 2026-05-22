/**
 * Recommendations feature — public barrel.
 * Import from here, not the underlying files, so callers stay
 * insulated if internals get reorganised.
 */

export * from "./client";
export { useRecommendations, type DecoratedRecommendation } from "./useRecommendations";
export { RecommendButton } from "./RecommendButton";
export { RecommendDialog } from "./RecommendDialog";
export { RecommendationsTab } from "./RecommendationsTab";
