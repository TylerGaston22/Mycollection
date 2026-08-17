/**
 * Auth helpers barrel — keep all auth-flow utilities behind this entry
 * point so the rest of the app doesn't reach into individual files.
 */

export {
  SYNTHETIC_EMAIL_DOMAIN,
  validateUsername,
  usernameToSyntheticEmail,
  isSyntheticEmail,
  resolveSignInEmail,
  isValidEmailFormat,
} from "./username";
export type { UsernameValidationResult } from "./username";
export { AUTH_INPUT_CLASS, AUTH_CARD_CLASS } from "./styles";
export { loadProfile } from "./loadProfile";
export { signInWithUsername } from "./signInWithUsername";
