// Every browser storage access in the app goes through this module. Storage can throw
// (SecurityError in blocked-cookie modes, quota errors) and does not exist during SSR, so each
// call is wrapped and failure is reported as null/false instead of an exception.
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const safeStorage = {
  get(key: string): string | null {
    try {
      return getStorage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      const storage = getStorage();
      if (!storage) return false;
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): boolean {
    try {
      const storage = getStorage();
      if (!storage) return false;
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  available(): boolean {
    try {
      const storage = getStorage();
      if (!storage) return false;
      const probe = '__ik_storage_probe__';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  },
};
