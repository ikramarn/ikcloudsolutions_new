import { safeStorage } from '@/lib/storage';

// Keys written by the old client-only site (fake login, plaintext passwords, demo data).
// These strings are allow-listed in the claims guard ONLY in this file.
const LEGACY_KEYS = [
  'ik_cloud_registered_users',
  'ik_cloud_user',
  'ik_cloud_courses',
  'ik_cloud_progress',
] as const;

/** Removes data left by the previous version of the site. Never throws. */
export function purgeLegacyStorage(): void {
  try {
    for (const key of LEGACY_KEYS) {
      safeStorage.remove(key);
    }
  } catch {
    // Nothing to do: visitors must never see an error because of old data.
  }
}
