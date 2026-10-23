import { afterEach, describe, expect, it, vi } from 'vitest';
import { purgeLegacyStorage } from '@/lib/academy/purge-legacy';
import { safeStorage } from '@/lib/storage';

function throwingStorage(): Storage {
  const fail = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  return {
    length: 0,
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('safeStorage during SSR (no window)', () => {
  it('returns null/false and never throws', () => {
    expect(safeStorage.get('a')).toBeNull();
    expect(safeStorage.set('a', 'b')).toBe(false);
    expect(safeStorage.remove('a')).toBe(false);
    expect(safeStorage.available()).toBe(false);
  });
});

describe('safeStorage with a throwing Storage', () => {
  it('swallows every error', () => {
    vi.stubGlobal('window', { localStorage: throwingStorage() });
    expect(safeStorage.get('a')).toBeNull();
    expect(safeStorage.set('a', 'b')).toBe(false);
    expect(safeStorage.remove('a')).toBe(false);
    expect(safeStorage.available()).toBe(false);
  });

  it('survives a localStorage getter that throws', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    expect(safeStorage.get('a')).toBeNull();
    expect(safeStorage.set('a', 'b')).toBe(false);
    expect(safeStorage.available()).toBe(false);
  });

  it('lets purgeLegacyStorage finish without throwing', () => {
    vi.stubGlobal('window', { localStorage: throwingStorage() });
    expect(() => purgeLegacyStorage()).not.toThrow();
  });
});

describe('safeStorage with working storage', () => {
  it('round-trips values', () => {
    vi.stubGlobal('window', { localStorage: memoryStorage() });
    expect(safeStorage.available()).toBe(true);
    expect(safeStorage.set('k', 'v')).toBe(true);
    expect(safeStorage.get('k')).toBe('v');
    expect(safeStorage.remove('k')).toBe(true);
    expect(safeStorage.get('k')).toBeNull();
  });
});

describe('purgeLegacyStorage', () => {
  it('removes the four legacy keys and nothing else', () => {
    const storage = memoryStorage({
      ik_cloud_registered_users: '[]',
      ik_cloud_user: '{}',
      ik_cloud_courses: '[]',
      ik_cloud_progress: '{}',
      ik_consent_v1: '{"version":1}',
    });
    vi.stubGlobal('window', { localStorage: storage });
    purgeLegacyStorage();
    expect(storage.length).toBe(1);
    expect(storage.getItem('ik_consent_v1')).toBe('{"version":1}');
  });
});
